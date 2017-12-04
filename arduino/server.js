const path = require('path')
let Serialport = require('serialport')
const FileSync = require('lowdb/adapters/FileSync')
const db = require('../db/db')

db.initDB(new FileSync(path.join(__dirname, '..', 'db/db.json')))

if (process.env.NODE_ENV == 'dev') { // Para testes
  Serialport = require('virtual-serialport')
}

let port = new Serialport("COM3", { baudRate: 9600 })

port.on('open', (err) => {
  console.log(`> ${__filename} Port open`)

  port.write("BLOOP") // manda para o Arduino
})

// Quando qualquer dado vem do Arduino é feito o comando baseando-se primeiramente
// no primeiro 'pedaço', que é o identificador do comando. Depois passa os dados para o index.
port.on('data', data => {
  let data_slices = data.split(':')

  switch (data_slices[0]) {
    // Solicitando entrada.
    case "0":
      process.send(`${data_slices[1]}:${data_slices[2]}`)
      break

    // Digitando o código.
    // TODO: Colocar feedbacks para o Arduino
    case "1":
      db.checkRelation(data_slices[1], Number(data_slices[2]))
        .then((id, key) => {
          process.send(`${id}:Visitante Subindo, código usado ${data_slices[2]}`)
        })
        .catch((err) => console.error(err))
  }
  console.log(`> ${__filename} From Arduino: ${data}`)
})

// NOTE: Remover quando não precisar mais.
module.exports = port

// NOTE: Isso é para colocar as coisas pra testar essa parte
// e simular o comportamento do Arduino. Foi a única forma que encontrei pra fazer isso.
require('../tests/arduino_server.test')
