require('dotenv').config() // load the env variables.
const { fork } = require('child_process')

const bot = fork('./bot/bot.js')
const server = fork('./arduino/server.js')

bot.on('message', (msg) => {
  console.log(msg)
  server.send(msg, (err) => console.log(err))
})

server.on('message', (msg) => {
  console.log(`> ${__filename} from server: ${msg}`)
  
  bot.send(msg)
})

server.on('close', (code) => {
  console.log("server close ", code)
})

bot.on('close', (code) => {
  console.log('bot close ', code)
})
