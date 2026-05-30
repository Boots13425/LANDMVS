import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/authRoutes.js'
import landRoutes from './routes/landRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import officerRoutes from './routes/officerRoutes.js'
import surveyorRoutes from './routes/surveyorRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/land', landRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/officer', officerRoutes)
app.use('/api/surveyor', surveyorRoutes)
app.use('/api/documents', documentRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

export default app
