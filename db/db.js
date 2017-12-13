/**
 * Arquivo que controla todo o acesso ao "banco de dados"
 * do programa. Cada função tem sua explicação de como funciona.
 * Modelo do Banco de Dados
 *
 * - Salvar entradas(quem pediu, hrs, código)
 * - Dados de Usuarios(telegram_id, nome, apartamento)
 */
const fs = require('fs')
const path = require('path')
const low = require('lowdb')

let rfid_reg
let db

/**
 * Inicia uma conexão com o bd de acordo com o adapter recebido.
 * E lê o arquivo do registro json dos códigos.
 *
 * @param {object} adapter
 */
function initDB(adapter) {
  db = low(adapter)

  const rfid_file = JSON.parse(fs.readFileSync(path.join(__dirname, '/rfid.json')))
  rfid_reg = rfid_file.register

  db.defaults({
    origin_id: rfid_file.origin_id,
    users: [],
    in_progress_relations: [],
    relations: []
  }).write()
}

// just for tests
const getDb = () => db

/**
 * Checa se o código bate com o do arquivo.
 *
 * @param {string} n
 */
function checkOrigin(n) {
  return db.get('origin_id').value() == n
}

/**
 * Salva um usuário no banco de dados.
 *
 * @param {number} id
 * @param {string} username
 * @param {string} firstname
 * @param {string} ap
 */
function saveUser(id, username, firstname, ap) {
  db.get('users')
    .push({ t_id: id, t_username: username, t_firstname: firstname, apto: ap })
    .write()
}

/**
 * Retorna o objeto do usuário
 *
 * @param {number} id identificador do usuário
 *
 * @return {object} 
 */
function getUser(id) {
  return db.get('users').find({ t_id: id }).value()
}

/**
 * Retorna o objeto do usuário baseado no numero do apto.
 *
 * @param {string}
 *
 * @return {object}
 */
function getUserByApto(num) {
  return db.get('users').find({ apto: num }).value()
}

/**
 * Atualiza propriedades de um usuário
 *
 * @param {number} id
 * @param {object} prop
 */
function updateProp(id, prop) {
  db.get('users')
    .find({ t_id: id })
    .assign(prop)
    .write()
}

/**
 * Verifica se o código é válido com algum usuário.
 *
 * @param {string} rfid
 *
 * @param {Promise} 
 */
function checkRFID(rfid) {
  return new Promise((resolve, reject) => {
    const rfid_obj = rfid_reg.find(el => el.rfid == rfid)
    if (!rfid_obj) {
      reject(new Error("Código RFID inexistente"))
    } else {
      const user = db.get('users').find({ apto: rfid_obj.apto }).value()

      if (user) {
        resolve(user)
      } else {
        reject(new Error("Nenhum usuário com o código"))
      }
    }
  })
}

/**
 * Cria uma relação no bd e coloca no in-progress.
 * 
 * A relação é criada com o número do apartamento de destino
 * do visitante e o código gerado.
 *
 * @param {number} sender id do enviador do código
 * @param {number} key código
 */
function createRelation(sender, key) {
  const user = getUser(sender)

  db.get('in_progress_relations')
    .push({ sender_id: sender, apto_dest: user.apto, key: key, opening: new Date(), closing: '' })
    .write()
}

/**
 *  Checa se o código é válido, se sim, passa para os finalizados.
 *  Função chamada somente pelo Arduino.
 *
 * @param {number} key código
 *
 * @return {Promise}
 */
function checkRelation(key) {
  let relation = db.get('in_progress_relations').find({ key: key }).value()

  return new Promise((resolve, reject) => {
    if (relation) {
      relation.closing = new Date()
      db.get('relations').push(relation).write()
      db.get('in_progress_relations').remove({ key: key }).write()
      
      resolve(relation.sender_id)
    } else {
      reject(new Error("Erro na autenticação"))
    }
  })
}

module.exports = {
  initDB,
  getDb,
  checkOrigin,
  saveUser,
  getUser,
  getUserByApto,
  updateProp,
  checkRFID,
  createRelation,
  checkRelation,
}
