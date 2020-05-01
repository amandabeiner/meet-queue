const express = require('express')
const admin = require('firebase-admin')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.get('/', function(req, res) {
  res.render('index.ejs')
})

io.sockets.on('connection', function(socket) {
  const queue = []

  socket.on('username', function(username) {
    socket.username = username
  })

  socket.on('enqueue', function() {
    queue.push(socket.username)
    console.log(socket.queue)
    io.emit('enqueue', socket.username)
  })
})

app.use(express.static(__dirname))
http.listen(8080, function() {
  console.log('listening on port 8080')
})
