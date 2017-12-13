const path = require('path')
let Serialport = require('serialport')
const Readline = Serialport.parsers.Readline

const NodeWebcam = require('node-webcam')

const FileSync = require('lowdb/adapters/FileSync')
const db = require('../db/db')

db.initDB(new FileSync(path.join(__dirname, '..', 'db/db.json')))

if (process.env.NODE_ENV == 'dev') { // Para testes sem o Arduino 
  Serialport = require('virtual-serialport')
}

const parser = new Readline({ delimiter: '\r\n' })
const port = new Serialport(process.env.PORT, { baudRate: 9600 })

const webcam_opts = {
  quality: 100,
  delay: 0,
  saveShots: true,

  // [jpeg, png] support varies
  output: "png",
  device: false,
  callbackReturn: "location",
  verbose: true
}

port.pipe(parser)

port.on('open', (err) => {
  console.log(`> ${__filename} Port open`)

  port.write("BLOOP") // manda para o Arduino
})

if (process.env.NODE_ENV == 'dev') {
  port.on('data', onData) // Para testar sem Arduino
} else {
  parser.on('data', onData)
}

// Quando qualquer dado vem do Arduino é feito o comando baseando-se primeiramente
// no primeiro 'pedaço', que é o identificador do comando. Depois passa os dados para o index.
function onData(data) {
  let data_slices = data.split(':')

  switch (data_slices[0]) {
    // Entrada de um morador.
    case "0":
      db.checkRFID(data_slices[1])
        .then((user) => {
          process.send(`${user.t_id}: Bem Vindo ${user.t_firstname}!`)
        })
        .catch((err) => console.error(err))
      break

    // Digitando um código pre-definido.  
    case "1":
      db.checkRelation(data_slices[1])
        .then((id) => {
          process.send(`${id}:Visitante Subindo, código usado ${data_slices[1]}`)
        })
        .catch((err) => console.error(err))
      break

    // Solicitando acesso.
    case "2":
      const img_path = path.join(__dirname, '..', `/db/imgs/${(new Date()).toDateString().replace(/\s/g, '')}.png`)
      NodeWebcam.capture(img_path, webcam_opts, (err, data) => {
        if (err) console.log(err)
        console.log(data)
        process.send(`2:${data_slices[1]}:${img_path}`)
      })
      break
  }
  console.log(`> ${__filename} From Arduino: ${data}`)
}

process.on('massage', (msg) => {
  // Enviar para o Arduino
  console.log("From bot to Arduino " + msg)
})

// NOTE: Remover quando não precisar mais.
module.exports = port

// NOTE: Isso é para colocar as coisas pra testar essa parte
// e simular o comportamento do Arduino. Foi a única forma que encontrei pra fazer isso.
require('../tests/arduino_server.test')
