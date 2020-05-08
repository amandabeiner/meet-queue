// var firebaseConfig = {
//   apiKey: 'AIzaSyAGDcE1JIePpzJ66lRlIKDyY87aykZNjQ8',
//   authDomain: 'meet-queue.firebaseapp.com',
//   databaseURL: 'https://meet-queue.firebaseio.com',
//   projectId: 'meet-queue',
//   storageBucket: 'meet-queue.appspot.com',
//   messagingSenderId: '539893296334',
//   appId: '1:539893296334:web:b604f203bc04fe8825b49f',
//   measurementId: 'G-19MMWPTZ20',
// }
//
// firebase.initializeApp(firebaseConfig)
//
// const initApp = () => {
//   firebase.auth().onAuthStateChanged((user) => {
//     if (user) {
//       chrome.browserAction.setPopup({
//         popup: 'client.html',
//       })
//     }
//   })
// }
const socket = io.connect('http://localhost:8080')
// chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
//   switch (msg.type) {
//     case 'ready':
//       sendResponse(firebase.auth().currentUser.displayName)
//   }
// })
//
socket.on('enqueue', (enqueuedUser) => {
  chrome.tabs.query(activeTab, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'ENQUEUED_SUCCESS',
      data: { user: enqueuedUser },
    })
  })
})

socket.on('fetch_queue_success', (queue) => {
  chrome.tabs.query(activeTab, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'FETCH_QUEUE_SUCCESS',
      data: { queue },
    })
  })
})

chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.type) {
    case 'ENQUEUE':
      return socket.emit('enqueue', msg.data.user, msg.data.route)
    case 'FETCH_QUEUE':
      return socket.emit('fetch_queue', msg.data.route)
  }
})

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query(activeTab, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'CLICKED_BROWSER_ACTION' })
  })
})
const activeTab = { active: true, currentWindow: true }
