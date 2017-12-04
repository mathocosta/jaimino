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
 * A relação é criada com o número do apartamento de destino
 * do visitante e o código gerado.
 *
 * @param {number} sender id do enviador do código
 * @param {number} key código
 */
function createRelation(sender, key) {
  const user = getUser(sender)

  db.get('in_progress_relations')
    .push({ sender_id: sender, apto_dest: user.apto, key: key, time: '' })
    .write()
}

/**
 *  Checa se o código é válido, se sim, passa para os finalizados.
 *  Função chamada somente pelo Arduino.
 *
 * @param {number} apto apartamento de destino
 * @param {number} key código
 */
// FIXME: Colocar para retornar uma promise
function checkRelation(apto, key) {
  let relation = db.get('in_progress_relations').find({ apto_dest: apto, key: key }).value()

  console.log(relation)
  return new Promise((resolve, reject) => {
    if (relation) {
      relation.time = new Date()
      db.get('relations').push(relation).write()
      db.get('in_progress_relations').remove({ apto_dest: apto, key: key }).write()
      
      resolve(relation.sender_id)
    } else {
      reject(new Error("Erro na autenticação"))
    }
  })
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
