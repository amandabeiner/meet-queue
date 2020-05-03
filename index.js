const express = require('express')
const bodyParser = require('body-parser')
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

app.use(express.static(__dirname))
app.set('views', __dirname + '/views')
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.use(bodyParser.json())
app.get('*', function (req, res) {
  res.render('index.html')
})

http.listen(8080, function () {
  console.log('listening on port 8080')
})

io.sockets.on('connection', function (socket) {
  socket.on('signed_in', async function (user) {
    socket.user = user
    const url = getUrlPath(socket)
    const existingReservations = await findReservations(url)
    socket.emit('received_reservations', existingReservations)
  })

  socket.on('enqueue', function () {
    createReservation(socket.user, getUrlPath(socket))
    io.emit('enqueue', socket.user)
  })
})

const getUrlPath = (socket) => {
  return url.parse(socket.handshake.headers.referer).path
}

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
