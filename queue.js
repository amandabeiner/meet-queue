var firebaseConfig = {
  apiKey: 'AIzaSyAGDcE1JIePpzJ66lRlIKDyY87aykZNjQ8',
  authDomain: 'meet-queue.firebaseapp.com',
  databaseURL: 'https://meet-queue.firebaseio.com',
  projectId: 'meet-queue',
  storageBucket: 'meet-queue.appspot.com',
  messagingSenderId: '539893296334',
  appId: '1:539893296334:web:b604f203bc04fe8825b49f',
  measurementId: 'G-19MMWPTZ20',
}

firebase.initializeApp(firebaseConfig)

const socket = io.connect('http://localhost:8080')
const provider = new firebase.auth.GoogleAuthProvider()

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    socket.emit('signed_in', user.displayName)
  } else {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        const user = result.user.displayName
        socket.emit('signed_in', user)
      })
  }
})

socket.on('received_reservations', function (reservations) {
  reservations.forEach((r) => {
    createListItem(r.username)
  })
})

socket.on('enqueue', function (username) {
  createListItem(username)
})

const createListItem = (value) => {
  li = document.createElement('li')
  li.innerHTML = value
  document.getElementById('queue').append(li)
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('enqueue').addEventListener('click', () => {
    socket.emit('enqueue')
  })
})
