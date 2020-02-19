const util = require("util")
const { exec } = require("child_process")
const execAsync = util.promisify(exec)
const express = require("express")
const app = express()
const port = 3000

const ESSID_REGEX = /ESSID:"(.*)"/g

async function scanWifi() {
  const cmd = await execAsync("sudo iwlist wlan0 scan", { encoding: "utf-8" })
  const output = cmd.stdout.split(/\r?\n/).filter(it => it.length > 0 && it.includes("ESSID"))
    .map(it => {
      const match = ESSID_REGEX.exec(it)
      if (match) {
        return match[1]
      } else {
        return ""
      }
    })
    .filter(it => it.length > 0)
  return output
}

app.get("/", (req, res) => {
  res.send("Hello world!")
})

app.get("/scan", async (req, res) => {
  const ssids = await scanWifi()
  res.json(ssids)
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
