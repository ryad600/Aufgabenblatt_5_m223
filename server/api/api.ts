import { Request, Response, Express } from 'express'
import { Authentication } from '../authentication'
import { User } from '../database'

export class API {
  // Properties
  app: Express
  auth: Authentication
  // Constructor
  constructor(app: Express, auth: Authentication) {
    this.app = app
    this.auth = auth
    this.app.get('/hello', this.sayHello)
    this.app.get(
      '/hello/secure',
      this.auth.authenticate.bind(this.auth),
      this.sayHelloSecure
    )
  }
  // Methods
  private sayHello(req: Request, res: Response) {
    res.send('Hello There!')

    const user1 = new User(1, 5000, 1234)
    const user2 = new User(2, 10000, 4321)

    user1.transfer(2, 1000, 12345)

    user1.transfer(2, 1000, 1234)

    user2.transfer(1, 15000, 4321)

    user1.transfer(2, -1000, 1234)

    user1.transfer(10, 100000, 1234)
  }

  private sayHelloSecure(req: Request, res: Response) {
    res.status(200).json({ message: 'Hello There from Secure endpoint!' })
  }
}


