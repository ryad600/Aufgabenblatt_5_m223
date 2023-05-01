import { Request, Response, Express } from 'express'
import * as bcrypt from 'bcrypt'
import { sign, verify } from 'jsonwebtoken'

interface Token {
  userId: number
  iat: number
  exp: number
}
declare global {
  namespace Express {
    export interface Request {
      token?: Token
    }
  }
}

const dummyUsers = [
  {
    id: 1,
    username: 'user1',
    password: '$2b$10$gXVc4gHCNyfjv3EveLzwuubpM71fSpIhR35RLUK5hok3ffuA4bpYW',
  }, // bcrypt hash for 'password1'
  {
    id: 2,
    username: 'user2',
    password: '$2b$10$ydHRp2v7K/8CMllSRmWTe.RcdrQpOpZAb1NJ/6F2nOItQa.LgFVNy',
  }, // bcrypt hash for 'password2'
  {
    id: 3,
    username: 'user3',
    password: '$2b$10$u04KSu6u3AJJTrSVXdl6B.SnkQ1DF/hfPDsC/7M/PzLp74Y3hR02i',
  }, // bcrypt hash for 'password3'
]

export class Authentication {
  // Properties
  app: Express
  private secretKey: string
  constructor(secretKey: string, app: Express) {
    this.secretKey = secretKey
    this.app = app
    this.app.post('/login/token', this.createToken.bind(this))
  }

  private async createToken(req: Request, res: Response) {
    const { username, password } = req.body

    const user = dummyUsers.find((user) => user.username === username)
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }

    const token = sign({ userId: user.id }, this.secretKey, { expiresIn: '1h' })
    res.json({ token })
  }

  public static async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    return hash
  }

  public verifyToken(token: string) {
    return verify(token, this.secretKey)
  }

  public authenticate(req: Request, res: Response, next: any) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing Authorization header' })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' })
    }

    try {
      const decoded = verify(token, this.secretKey) as Token
      if (!isString(decoded)) {
        req.token = decoded
      }
      next()
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' })
    }
  }
}

const isString = (value: any): value is string => typeof value === 'string'
