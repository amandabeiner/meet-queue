const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const admin = require('firebase-admin')
const cors = require('cors')
require('dotenv').config()

const checkToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.slice(7, authHeader.length)

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        res.json({ success: false, message: 'Invalid token' })
      } else {
        res.decoded = data
        next()
      }
    })
  } else {
    return res.json({ success: false, message: 'Invalid token' })
  }
}
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(
    cors({
      origin: 'chrome-extension://gekkhhhgmaamjlecijplpbmghbjbacgl/',
      credentials: true,
    })
  )

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

http.listen(8080, function () {
  console.log('listening on port 8080')
})

app.get('/authenticate', (req, res) => {
  const { username } = req.query
  if (!username) {
    return res.status(401).end()
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    algorithm: process.env.JWT_ALGORITHM,
  })

  res.json({ token }).end()
})

app.get('/queue', checkToken, async (req, res) => {
  const { route } = req.query
  const queue = await findReservations(route)

  res.json({ queue }).end()
})

io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) return next(new Error('Invalid token'))
        socket.decoded = decoded
        next()
      }
    )
  } else {
    next(new Error('Invalid token'))
  }
}).on('authenticated', function (socket) {
  socket.on('auth_success', function (user) {
    socket.user = user
  })

  socket.on('enqueue', function (url) {
    createReservation(socket.user, url)
    io.emit('enqueue', socket.user)
  })
})
// io.sockets
// .on(
//   'connection',
//   socketioJwt.authorize({
//     secret: process.env.JWT_SECRET,
//     timeout: 1500,
//   })
// )

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

