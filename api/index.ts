import dotenv from 'dotenv'
dotenv.config()

import path from 'path'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import routes from '../server/src/routes'
import { errorHandler } from '../server/src/middleware/errorHandler'

const app = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }))
app.use(compression())
app.use(morgan('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cookieParser())

app.use('/api', routes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

export default app
