const { exec } = require("child_process")
const express = require("express")
const app = express()
const port = 3000

function scanWifi() {
  exec("sudo iwlist wlan0 scan", (err, stdout, stderr) => {
    if (err) {
      return []
    }
    if (stderr) {
      return []
    }

    const output = stdout.split(/\r?\n/).filter(it => it.length > 0 && it.includes("ESSID"))
    return output
  })
}

app.get("/", (req, res) => {
  res.send("Hello world!")
})

app.get("/scan", (req, res) => {
  const ssids = scanWifi()
  res.json(ssids)
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
