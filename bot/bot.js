const path = require('path')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const FileSync = require('lowdb/adapters/FileSync')
const db = require('../db/db')

db.initDB(new FileSync(path.join(__dirname, '..', 'db/db.json')))

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => {
  console.log('BOT SERVER: started with ', ctx.chat.id)
  const user = db.getUser(ctx.from.id)

  if (!user) {
    ctx.reply('Olá, eu sou Jaimino.')
    ctx.reply(
      `Preciso que digite o código de segurança para liberar o sistema, por favor digite o código com 5 dígitos.`
    )
  } else {
    ctx.reply(`Tudo bem ${user.t_firstname}?`)
  }
})

// Código de senha
bot.hears(/[0-9]{5}/, (ctx) => {
  if (!db.getUser(ctx.from.id)) {
    if (db.checkOrigin(ctx.message.text)) {
      db.saveUser(ctx.from.id, ctx.from.username, ctx.from.first_name, null)
      ctx.reply('Codigo CORRETO. Por favor digite agora seu apartamento.')
    } else {
      ctx.reply('Código incorreto.')
    }
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
  const apto = db.getUser(ctx.from.id).apto

  db.createRelation(ctx.from.id, `${apto}${n}`)

  ctx.reply(`Segue o código gerado: ${apto}${n}`)
})

bot.command('/test', (ctx) => {
 })

bot.catch(err => console.error('Erro: ', err))

bot.startPolling()

function requestAccess(chat_id, src) {
  bot.telegram.sendPhoto(chat_id, { source: src })
  bot.telegram.sendMessage(chat_id, "Pessoa solicitando a entrada. Permitir?", Markup.inlineKeyboard([
      Markup.callbackButton('Sim', 'P_Sim'),
      Markup.callbackButton('Não', 'P_Não')
    ]).extra()
  )
}

bot.action('P_Sim', (ctx) => {
  ctx.reply('👍')
  process.send('2:1')
})

bot.action('P_Não', (ctx) => {
  ctx.reply('👍, Não Abrir')
  process.send('2:0')
})

// Para receber as mensagens do arduino
process.on('message', (msg) => {
  let data = msg.split(":")

  if (data[0] == "2") { // caso seja para solicitar acesso
    const user = db.getUserByApto(data[1])
    requestAccess(user.t_id, `${data[2]}:${data[3]}`)
  } else {
    bot.telegram.sendMessage(Number(data[0]), data[1])
    console.log(`> ${__filename} Enviando: '${data[1]}' ao ${data[0]}`)
  }
})
