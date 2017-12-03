require('dotenv').config() // load the env variables.
const { fork } = require('child_process')

const bot = fork('./bot/bot.js')
const server = fork('./arduino/server.js')

server.on('message', (msg) => {
  console.log(`> ${__filename} from server: ${msg}`)
  bot.send(msg)
})