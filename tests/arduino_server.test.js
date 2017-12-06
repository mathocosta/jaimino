require('dotenv').config()

const path = require('path')
const port = require('../arduino/server')

if (process.env.NODE_ENV == 'dev') {
  port.on('dataToDevice', (data) => {   // caso um dado for para o device
    port.writeToComputer(`0:22 4A 9C 0B`)  // apenas para testes
  })
}
