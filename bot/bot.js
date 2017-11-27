require('dotenv').config() // load the env variables
const path = require('path')
const Telegraf = require('telegraf')
const FileSync = require('lowdb/adapters/FileSync')
const db = require('../db/db')

db.initDB(new FileSync(path.join(__dirname, '..', 'db/db.json')))

const bot = new Telegraf(process.env.BOT_TOKEN)

/**
 * Comandos
 *
 * - /start: pegar o id e qual o apartamento dele.
 * - /help: dar um help
 * - /libere <num>: gerar um código e enviar de volta para poder enviar ao recebedor.
 *    TODO: ver como deve ser feito:
 *      - ou a mesma pessoa q pede, recebe,
 *      - ou a pessoa q recebe fala com o bot.
 */
bot.start((ctx) => {
  console.log('SERVER: started with ', ctx.from.id)
  if (!db.userExist(ctx.from.id)) {
    db.saveUser(ctx.from.id, ctx.from.username, "")
  }

  return ctx.reply('Olá, por favor, diga seu apartamento: ')
})

bot.hears(/[0-9]{3}/, (ctx) => {
  return ctx.reply(`Ok, ${ctx.from.username} seu apartamento é ${ctx.message.text}.`)
})

bot.command('help', (ctx) => {
  const msg = `Para usar, você deve escolher um dos comandos:
  /ola - Para que eu fale ola.
  /help - Para ver essa linda mensagem.`
  return ctx.reply(msg)
})

bot.command('ola', ctx => ctx.reply('ola'))

bot.catch(err => console.error('Erro: ', err))

bot.startPolling()