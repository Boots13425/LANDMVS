import app from './app.js'
import dotenv from 'dotenv'
import pool from './config/database.js'

dotenv.config()

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()')
    console.log('✓ Database connection successful:', result.rows[0])

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`)
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`✓ API: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('✗ Failed to start server:', error.message)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n✓ Shutting down gracefully...')
  await pool.end()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n✓ Shutting down gracefully...')
  await pool.end()
  process.exit(0)
})

startServer()
