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

console.log(firebase.auth().currentUser)
const socket = io.connect('http://localhost:8080')
let user
let route

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

const initQueue = () => {
  chrome.runtime.sendMessage({ type: 'ready' }, (response) => {
    user = response
  })

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const route = new URL(tabs[0].url).pathname.substr(1)

    socket.emit('request_reservations', route)

    document.getElementById('enqueue').addEventListener('click', () => {
      console.log(user)
      socket.emit('enqueue', user, socket.url)
    })
  })
}

window.onload = () => initQueue()
