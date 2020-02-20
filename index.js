const util = require("util")
const { exec } = require("child_process")
const execAsync = util.promisify(exec)
const express = require("express")
const path = require("path")
const port = 3000

const NEW_LINE_REGEX = /\r?\n/
const ESSID_REGEX = /ESSID:"(.*)"/
const IPV4_INET_REGEX = /inet (\d+\.\d+\.\d+\.\d+)/
const UTF8_ENCODING = { encoding: "utf-8" }

const app = express()
app.use(express.static(path.join("vue", "dist")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function distinct(value, index, self) {
  return self.indexOf(value) === index
}

async function scanWifi() {
  const cmd = await execAsync("sudo iwlist wlan0 scan", UTF8_ENCODING)
  const output = cmd.stdout
    .split(NEW_LINE_REGEX)
    .filter(it => it.includes("ESSID"))
    .map(it => {
      const match = ESSID_REGEX.exec(it)
      if (match) {
        return match[1]
      } else {
        return ""
      }
    })
    .filter(it => it.length > 0)
    .filter(distinct)
  return output
}

async function localIpv4Addr(interfaceName) {
  const cmd = await execAsync(`ifconfig ${interfaceName}`, UTF8_ENCODING)
  const addr = IPV4_INET_REGEX.exec(cmd.stdout)
  if (addr == null) {
    return "unknown"
  }
  return addr[1]
}

app.get("/test", (req, res) => {
  res.send("Hello world!")
})

app.get("/scan", async (req, res) => {
  const ssids = await scanWifi()
  res.json(ssids)
})

app.get("/ipv4", async (req, res) => {
  const ipv4Addr = await localIpv4Addr("wlan0")
  res.send(ipv4Addr)
})

app.get("/ipv4ap", async (req, res) => {
  const ipv4Addr = await localIpv4Addr("uap0")
  res.send(ipv4Addr)
})

app.get("/connected", async (req, res) => {
  const cmd = await execAsync(`iwgetid`, UTF8_ENCODING)
  const match = ESSID_REGEX.exec(cmd.stdout)
  const ssid = match ? match[1] : "UNKNOWN"
  res.json({ ssid: ssid })
})

app.post("/connect", async (req, res) => {
  const json = req.body
  const ssid = json.ssid
  const password = json.password

  const cmd = await execAsync(`wpa_cli add_network`, UTF8_ENCODING)
  const addedNetwork = cmd.stdout.trim().split(NEW_LINE_REGEX)
  const networkId = parseInt(addedNetwork[addedNetwork.length - 1])

  await execAsync(`wpa_cli set_network ${networkId} ssid '"${ssid}"'`, UTF8_ENCODING)
  if (password) {
    await execAsync(`wpa_cli set_network ${networkId} psk '"${password}"'`, UTF8_ENCODING)
  } else {
    await execAsync(`wpa_cli set_network ${networkId} key_mgmt NONE`, UTF8_ENCODING)
  }
  await execAsync(`wpa_cli enable_network ${networkId}`, UTF8_ENCODING)
  await execAsync(`wpa_cli save_config`, UTF8_ENCODING)

  // Wait 5 seconds
  await sleep(5000)

  // Restart dhcpcd
  await execAsync(`systemctl restart dhcpcd`)

  // Wait another 10 seconds
  await sleep(10000)

  // Ping google.com for 5 seconds
  const pingCmd = await execAsync(`ping google.com -w 5`)

  res.json({ ping: pingCmd.stdout })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
