import express, { Request, Response } from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', env: { db: !!process.env.DATABASE_URL, node: process.version } })
})

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`
    res.json({ connected: true, result })
  } catch (e: any) {
    res.status(500).json({ connected: false, error: e.message })
  }
})

export default app
