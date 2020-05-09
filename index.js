const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const admin = require('firebase-admin')
require('dotenv').config()

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

http.listen(8080, function () {
  console.log('listening on port 8080')
})

io.sockets.on('connection', function (socket) {
  socket.on('auth_success', function (user) {
    socket.user = user
  })

  socket.on('fetch_queue', async function (url) {
    const existingReservations = await findReservations(url)
    socket.emit('fetch_queue_success', existingReservations)
  })

  socket.on('enqueue', function (url) {
    createReservation(socket.user, url)
    io.emit('enqueue', socket.user)
  })
})

const findReservations = async (urlPath) => {
  const ONE_HOUR = 60 * 60 * 1000
  const oneHourAgo = Date.now() - ONE_HOUR
  const collectionSnapshot = await admin
    .firestore()
    .collection('queues')
    .doc(urlPath)
    .collection('reservations')
    .where('createdAt', '>', oneHourAgo)
    .orderBy('createdAt', 'asc')
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
