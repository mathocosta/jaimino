const { expect } = require('chai')
const low = require('lowdb')
const Memory = require('lowdb/adapters/Memory')
const db = require('../db/db')

db.initDB(new Memory())

describe('saveUser function', () => {
  it('Deve adicionar um usuário', () => {
    db.saveUser(123, 'matho', '')

    expect(
      db.getDb().get('users')
        .find({ t_id: 123 })
        .value().t_id
    ).to.equal(123)
  })
})

describe('userExist function', () => {
  it('Deve retornar um objeto se existir', () =>
    expect(db.userExist(123)).to.be.not.undefined
  )

  it('Deve retornar undefined se não existir', () =>
    expect(db.userExist(222)).to.be.undefined
  )
})