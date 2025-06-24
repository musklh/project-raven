const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('mock/db.json')
const middlewares = jsonServer.defaults()
const customRoutes = require('./routes.json')

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)

// Custom route for login
server.post('/api/login', (req, res) => {
  const { email, password } = req.body
  if (email && password) {
    res.status(200).json({
      token: 'fake-jwt-token-for-user-' + Date.now(),
      user: {
        name: 'Olivia Martin',
        email: email,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOcd2PQneGnvjzSPZcFlioYtm5dSWX4GKtZCJSnkhKjIdOEyRZbgeyr6hCor0kAnAHO4C__XW7gn-7pp8Ih2HbVik8J_ZFXF6--GcSZBTr89sJc1UiCkayAZiQrRSFs2wtRxGRPpi104ZBnewuaRpmx_-15O9Z99gn6xZ-mtJhXkWsUDPEDOomj66SFFtqCNNWe1vHQVu4Ed0JnEU71vRWc9Fy0cCE19aLTp9gJkM_pDZE7RRFygaG2S1y8CWf6UP4Dps0W0uIPvic'
      }
    })
  } else {
    res.status(400).json({ message: 'Email and password are required' })
  }
})

// Custom route for refreshing a report
server.post('/api/reports/:id/refresh', (req, res) => {
  const { id } = req.params;
  const db = router.db; // lowdb instance
  const report = db.get('reports').find({ id: parseInt(id) }).value();

  if (report) {
    // Simulate processing
    db.get('reports')
      .find({ id: parseInt(id) })
      .assign({ status: 'Processing', statusColor: 'bg-[var(--warning-bg)] text-[var(--warning-text)]' })
      .write();
    
    // After a delay, set it back to completed
    setTimeout(() => {
      db.get('reports')
        .find({ id: parseInt(id) })
        .assign({ 
            status: 'Completed', 
            statusColor: 'bg-[var(--success-bg)] text-[var(--success-text)]',
            created: new Date().toISOString().split('T')[0]
        })
        .write();
    }, 3000);

    res.status(202).json({ message: 'Report refresh initiated.' });
  } else {
    res.status(404).json({ message: 'Report not found' });
  }
});

// Use default router and custom routes
server.use(jsonServer.rewriter(customRoutes))
server.use(router)

server.listen(3001, () => {
  console.log('JSON Server is running on port 3001')
}) 