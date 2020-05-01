const express = require('express')
const admin = require('firebase-admin')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const url = require('url')
require('dotenv').config()

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

app.get('*', function (req, res) {
  res.render('index.ejs')
})

app.use(express.static(__dirname))
http.listen(8080, function () {
  console.log('listening on port 8080')
})

io.sockets.on('connection', function (socket) {
  socket.on('loaded', async function () {
    const url = getUrlPath(socket)
    const existingReservations = await findReservations(url)
    socket.emit('received_reservations', existingReservations)
  })

  socket.on('username', function (username) {
    socket.username = username
  })

  socket.on('enqueue', function () {
    createReservation(socket.username, getUrlPath(socket))
    io.emit('enqueue', socket.username)
  })
})

const getUrlPath = (socket) => {
  return url.parse(socket.handshake.headers.referer).path
}

const findReservations = async (urlPath) => {
  const collectionSnapshot = await admin
    .firestore()
    .collection('queues')
    .doc(urlPath)
    .collection('reservations')
    .get()

  return collectionSnapshot.docs.map((d) => d.data())
}

const createReservation = (username, urlpath) => {
  admin
    .firestore()
    .collection('queues')
    .doc(urlpath)
    .collection('reservations')
    .doc(Date.now().toString())
    .set({ username, createdAt: Date.now() })
}
