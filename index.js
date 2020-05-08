const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')
const admin = require('firebase-admin')
const url = require('url')
require('dotenv').config()

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

// app.use(express.static(__dirname))
// app.set('views', __dirname)
// app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html') /
  // app.use(
  //   bodyParser.urlencoded({
  //     extended: true,
  //   })
  // )

  // app.use(bodyParser.json())
  app.get('*', function (req, res) {
    res.render('client.html')
  })

http.listen(8080, function () {
  console.log('listening on port 8080')
})

io.sockets.on('connection', function (socket) {
  socket.on('fetch_queue', async function (url) {
    const existingReservations = await findReservations(url)
    socket.emit('fetch_queue_success', existingReservations)
  })

  socket.on('enqueue', function (user, url) {
    createReservation(user, url)
    io.emit('enqueue', user)
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
  console.log({ urlpath })
  admin
    .firestore()
    .collection('queues')
    .doc(urlpath)
    .collection('reservations')
    .doc(Date.now().toString())
    .set({ username, createdAt: Date.now() })
}
