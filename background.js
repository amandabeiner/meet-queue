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
socket.on('connected', () => {
  console.log('connected')
})

const initApp = () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      chrome.browserAction.setPopup({
        popup: 'client.html',
      })
    }
  })
}

window.onload = () => initApp()
