const express = require('express')
const app = express()

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hello from AYUB OS' })
})

module.exports = app
