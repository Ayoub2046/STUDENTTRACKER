// Minimal serverless entry - logs errors to diagnose the crash
const express = require('express')
const app = express()

app.use(express.json())

// Test health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Lazy load the full app
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next()
  try {
    const { default: routes } = await import('../server/src/routes/index.ts')
    // Mount routes properly by creating a sub-app
    const subApp = express()
    subApp.use(routes)
    subApp(req, res, next)
  } catch (e) {
    res.status(500).json({
      error: 'Server failed to initialize',
      name: e.name,
      message: e.message,
      stack: e.stack?.split('\n').slice(0, 10).join('\n')
    })
  }
})

module.exports = app
