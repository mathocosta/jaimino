require('dotenv').config() // load the env variables
const path = require('path')
const Telegraf = require('telegraf')
const FileSync = require('lowdb/adapters/FileSync')
const db = require('../db/db')

db.initDB(new FileSync(path.join(__dirname, '..', 'db/db.json')))

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => {
  console.log('SERVER: started with ', ctx.from.id)

  ctx.reply('Olá, eu sou Jaimino.')
  ctx.reply(
    `Preciso que digite o código de segurança para liberar o sistema, por favor digite o código com 5 dígitos.`
  )
})

// Código de senha
bot.hears(/[0-9]{5}/, (ctx) => {
  if (!db.getUser(ctx.from.id)) {
    ctx.reply('Codigo CORRETO')
    db.saveUser(ctx.from.id, ctx.from.username, ctx.from.first_name, null)
    ctx.reply('Por favor digite agora seu apartamento.')
  }
})

// Código para trocar o apartamento
bot.hears(/[0-9]{3}/, (ctx) => {
  const t_id = ctx.from.id
  const ap_num = ctx.message.text

  if (db.getUser(t_id)) {
    // O numero do apto ainda não foi registrado.
    if (db.getUser(t_id).apto === null) {
      db.updateProp(t_id, { apto: ap_num })
      ctx.reply(`Ok ${ctx.from.first_name}, seu apartamento foi registrado como o ${ap_num}.`)
    }
  } else { // o usuario nao está cadastrado ainda.
    ctx.reply('Desculpe, mas é necessário o código de segurança.')
  }
})

bot.hears('ola', ctx => ctx.reply('Olá!'))

bot.command('gen', (ctx) => {
  const n = Math.floor(Math.random() * 9000) + 1000
  db.createRelation(ctx.from.id, n)

  ctx.reply(`Segue o código gerado: ${n}`)
})

bot.catch(err => console.error('Erro: ', err))

bot.startPolling()