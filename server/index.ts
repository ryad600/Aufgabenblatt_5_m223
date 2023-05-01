import express, { Express, Request, Response } from 'express'
import { API } from './api'
import http from 'http'
import { resolve, dirname } from 'path'
import { Database, User} from './database'
import { Authentication } from './authentication'
import * as bodyParser from 'body-parser'

class Backend {
  // Properties
  private _app: Express
  private _api: API
  private _database: Database
  private _env: string

  // Getters
  public get app(): Express {
    return this._app
  }

  public get api(): API {
    return this._api
  }

  public get database(): Database {
    return this._database
  }

  // Constructor
  constructor() {
    this._app = express()
    // support parsing of application/json type post data
    this._app.use(bodyParser.json())
    //support parsing of application/x-www-form-urlencoded post data
    this._app.use(bodyParser.urlencoded({ extended: true }))
    this._database = new Database()
    const auth = new Authentication('supersecret123', this._app)
    this._api = new API(this._app, auth)
    this._env = process.env.NODE_ENV || 'development'

    this.setupStaticFiles()
    this.setupRoutes()
    this.startServer()
  }

  // Methods
  private setupStaticFiles(): void {
    this._app.use(express.static('client'))
  }

  private setupRoutes(): void {
    this._app.get('/', (req: Request, res: Response) => {
      const __dirname = resolve(dirname(''))
      res.sendFile(__dirname + '/client/index.html')
    })
  }

  private startServer(): void {
    if (this._env === 'production') {
      http.createServer(this.app).listen(3000, () => {
        console.log('Server is listening!')
      })
    }
  }
}

export const backend = new Backend()
export const viteNodeApp = backend.app
