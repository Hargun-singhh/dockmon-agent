#!/usr/bin/env node

require("dotenv").config()

const WebSocket = require("ws")
const Docker = require("dockerode")
const fs = require("fs")
const os = require("os")
const path = require("path")
const readline = require("readline")

const docker = new Docker({ socketPath: "/var/run/docker.sock" })

const WS_URL = "wss://dockmon.onrender.com/agent"

const CONFIG_DIR = path.join(os.homedir(), ".dockmon")
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")

async function getDeviceToken() {

  if (fs.existsSync(CONFIG_FILE)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE))
    return config.device_token
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const token = await new Promise(resolve =>
    rl.question("Enter DockMon device token: ", answer => resolve(answer))
  )

  rl.close()

  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR)
  }

  fs.writeFileSync(CONFIG_FILE, JSON.stringify({
    device_token: token.trim()
  }, null, 2))

  console.log("Device token saved.")

  return token.trim()
}

async function startAgent() {

  const DEVICE_TOKEN = await getDeviceToken()

  console.log("Starting DockMon Agent...")

  const ws = new WebSocket(WS_URL)

  ws.on("open", () => {

    console.log("Connected to DockMon backend")

    ws.send(JSON.stringify({
      type: "register",
      device_token: DEVICE_TOKEN
    }))

  })

  ws.on("message", (data) => {
    console.log("Message from server:", data.toString())
  })

  ws.on("close", () => {
    console.log("Disconnected from server")
  })

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message)
  })

}

startAgent()
