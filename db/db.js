/**
 * Arquivo que controla todo o acesso ao "banco de dados"
 * do programa. Cada função tem sua explicação de como funciona.
 * Modelo do Banco de Dados
 *
 * - Salvar entradas(quem pediu, quem usou, hrs, código)
 * - Dados de Usuarios(telegram_id, nome, apartamento)
 */
const path = require('path')
const low = require('lowdb')

let db

/**
 * Inicia uma conexão com o bd de acordo com o adapter recebido.
 *
 * @param {Object} adapter
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
 * Cada usuário é salvo no formato:
 * 1. id
 * 2. username
 * 3. apto number
 *
 * @param {number} id
 * @param {string} name
 * @param {string} ap
 */
function saveUser(id, name, ap) {
  db.get('users')
    .push({ t_id: id, t_username: name, apto: ap })
    .write()
  // console.log(`DB: User ${id}:${name} save.`)
}

/**
 * Checa se o usuário existe.
 *
 * @param {number} id
 */
function userExist(id) {
  // console.log(db.get('users').find({ t_id: id }).value())
  return db.get('users').find({ t_id: id }).value()
}

/**
 * Cria uma relação no bd e coloca no in-progress.
 *
 * @param {number} sender id do enviador do código
 * @param {number} receiver id do recebedor do código
 */
function createRelation(sender, receiver) {
}

/**
 *  Checa se o código é válido, se sim, passa para os finalizados.
 *
 * @param {number} user id do que está usando o código
 * @param {number} key código
 */
function checkRelation(user, key) {
}

module.exports = {
  initDB,
  getDb,
  saveUser,
  userExist,
  createRelation,
  checkRelation,
}