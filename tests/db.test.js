const { expect } = require('chai')
const low = require('lowdb')
const Memory = require('lowdb/adapters/Memory')
const db = require('../db/db')

db.initDB(new Memory())

describe('saveUser function', () => {
  it('Deve adicionar um usuário', () => {
    db.saveUser(123, 'matho', 'Matheus', 444)

    expect(
      db.getDb().get('users')
        .find({ t_id: 123 })
        .value().t_id
    ).to.equal(123)
  })
})

describe('getUser function', () => {
  it('Deve retornar um objeto se existir', () =>
    expect(db.getUser(123)).to.be.not.undefined
  )

  it('Deve retornar undefined se não existir', () =>
    expect(db.getUser(222)).to.be.undefined
  )
})

describe('updateProp function', () => {
  db.saveUser(234, 'bin', 'Bin', null) // sem apartamento

  it('deve fazer o update do apto null', () => {
    db.updateProp(234, { apto: 333 })

    expect(db.getUser(234).apto).to.be.not.null
  })
})

describe('createRelation function', () => {
  it('deve criar uma relação e colocar no in-progress-relations', () => {
    db.createRelation(234, 44555)

    expect(
      db.getDb()
        .get('in_progress_relations')
        .find({ sender_id: 234, key: 44555 })
        .value()
    ).to.be.not.undefined
  })
})

describe('checkRelation function', () => {
  db.createRelation(123, 22222)
  db.checkRelation(123, 22222)

  it('deve remover dos in_progress', () => {
    expect(
      db.getDb()
        .get('in_progress_relations')
        .find({ sender_id: 123, key: 22222 })
        .value()
    ).to.be.undefined
  })

  it('deve adicionar nos finalizados', () => {
    expect(
      db.getDb()
        .get('relations')
        .find({ sender_id: 123, key: 22222 })
        .value()
    ).to.be.not.undefined
  })
})