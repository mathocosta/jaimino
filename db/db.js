/**
 * Arquivo que controla todo o acesso ao "banco de dados"
 * do programa. Cada função tem sua explicação de como funciona.
 * Modelo do Banco de Dados
 *
 * - Salvar entradas(quem pediu, hrs, código)
 * - Dados de Usuarios(telegram_id, nome, apartamento)
 */
const path = require('path')
const low = require('lowdb')

let db

/**
 * Inicia uma conexão com o bd de acordo com o adapter recebido.
 *
 * @param {object} adapter
 */
function initDB(adapter) {
  db = low(adapter)

  db.defaults({
    origin_id: 1234,
    users: [],
    in_progress_relations: [],
    relations: []
  }).write()
}

// just for tests
const getDb = () => db

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
 * Define o numero do apartamento de um usuário
 *
 * @param {number} id
 * @param {number} n
 */
function setAppNum(id, n) {
  db.get('users')
    .find({ t_id: id })
    .assign({ apto: n })
    .write()
}

/**
 * Retorna o objeto do usuário
 *
 * @param {number} id identificador do usuário
 */
function getUser(id) {
  return db.get('users').find({ t_id: id }).value()
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
 * Cria uma relação no bd e coloca no in-progress.
 *
 * @param {number} sender id do enviador do código
 * @param {number} key código
 */
function createRelation(sender, key) {
  db.get('in_progress_relations')
    .push({ sender_id: sender, key: key, time: '' })
    .write()
}

/**
 *  Checa se o código é válido, se sim, passa para os finalizados.
 *
 * @param {number} user id do que está usando o código
 * @param {number} key código
 */
function checkRelation(user, key) {
  let relation = db.get('in_progress_relations').find({ sender_id: user, key: key }).value()
  console.log(user, key)
  console.log(relation)
  if (relation) {
    relation.time = new Date()
    db.get('relations').push(relation).write()
    db.get('in_progress_relations').remove({ sender_id: user, key: key }).write()
  }
}

module.exports = {
  initDB,
  getDb,
  saveUser,
  getUser,
  updateProp,
  createRelation,
  checkRelation,
}