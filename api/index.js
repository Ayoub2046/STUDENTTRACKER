module.exports = (req, res) => {
  res.json({
    status: 'ok',
    method: req.method,
    path: req.url,
    env: {
      node: process.version,
      hasDb: !!process.env.DATABASE_URL,
      hasJwt: !!process.env.JWT_SECRET
    }
  })
}
