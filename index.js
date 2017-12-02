require('dotenv').config() // load the env variables.
const { fork } = require('child_process')
const bot = fork('./bot/bot.js')
