const util = require("util")
const { exec } = require("child_process")
const execAsync = util.promisify(exec)
const express = require("express")
const app = express()
const port = 3000

const ESSID_REGEX = /ESSID:"(.*)"/
const IPV4_INET_REGEX = /inet (\d+\.\d+\.\d+\.\d+)/

function distinct(value, index, self) {
  return self.indexOf(value) === index;
}

async function scanWifi() {
  const cmd = await execAsync("sudo iwlist wlan0 scan", { encoding: "utf-8" })
  const output = cmd.stdout
    .split(/\r?\n/)
    .filter(it => it.length > 0 && it.includes("ESSID"))
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
  const cmd = await execAsync(`ifconfig ${interfaceName}`, { encoding: "utf-8" })
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

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
