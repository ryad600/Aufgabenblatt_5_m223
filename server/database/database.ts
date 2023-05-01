import mariadb from 'mariadb'
import { Pool } from 'mariadb'
import { USER_TABLE } from './schema'
import { backend } from '../index'
import { isAwaitKeyword } from 'typescript'

export class Database {
  // Properties
  private _pool: Pool
  // Constructor
  constructor() {
    this._pool = mariadb.createPool({
      database: process.env.DB_NAME || 'minitwitter',
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'minitwitter',
      password: process.env.DB_PASSWORD || 'supersecret123',
      connectionLimit: 5,
    })
    this.initializeDBSchema()
  }
  // Methods
  private initializeDBSchema = async () => {
    console.log('Initializing DB schema...')
    await this.executeSQL(USER_TABLE)
  }

  public executeSQL = async (query: string) => {
    // establish connection
    const conn = await this._pool.getConnection()
    // begin transaction
    await conn.beginTransaction()
    console.log('Executing SQL query: ' + query)
    try {
      const res = await conn.query(query)
      // if everything is OK, commit transaction
      await conn.commit()
      conn.end()
      return res
    } catch (err) {
      // if something goes wrong, rollback transaction
      await conn.rollback()
      conn.end()
      console.log(err)
    }
  }

 

}

export class User {
  // Properties
  private _id: number
  private _balance: number
  private _pin: number

  // Constructor
  constructor(id: number, balance: number, pin: number) {
    this._id = id
    this._balance = balance
    this._pin = pin
    this.createUser(id, balance, pin)
  }

  // Methods
  public createUser = async (id: number, balance: number, pin: number) => {
    const query = `INSERT INTO users (balance, pin) VALUES (${balance}, ${pin})`
    await backend.database.executeSQL(query)
  }

  public transfer = async ( to: number, amount: number, pin: number) => {
    if (pin !== this._pin) return console.log('Invalid pin')
    if (to === this._id) return console.log('Cannot transfer to yourself')
    if (amount > this._balance) return console.log('Insufficient funds')
    if (amount < 0) return console.log('Invalid amount')

    const query = `UPDATE users SET balance = balance - ${amount} WHERE id = ${this._id}`
    const query2 = `UPDATE users SET balance = balance + ${amount} WHERE id = ${to}`
    await backend.database.executeSQL(query)
    await backend.database.executeSQL(query2)
  }

  
}


