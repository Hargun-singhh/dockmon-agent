#!/usr/bin/env node

require("dotenv").config();

const WebSocket = require("ws")
const Docker = require("dockerode")

const docker = new Docker({ socketPath: "/var/run/docker.sock" })

const WS_URL = "wss://dockmon.onrender.com/agent"
const DEVICE_TOKEN = process.env.DEVICE_TOKEN

if (!DEVICE_TOKEN) {
  console.error("DEVICE_TOKEN not set")
  process.exit(1)
}

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
