#!/usr/bin/env node

require("dotenv").config();
const WebSocket = require("ws");
const Docker = require("dockerode");