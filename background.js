const checkAuthStatus = () => {
  const { currentUser } = firebase.auth()
  return currentUser ? authSuccess(currentUser) : authRequest()
}

const authSuccess = (user) => {
  chrome.tabs.query({ url: 'https://meet.google.com/*' }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'AUTH_SUCCESS',
    })
  })
}

const authRequest = () => {
  chrome.tabs.query(activeTab, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'AUTH_REQUEST',
    })
  })
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log('state changed success')
    authSuccess(user)
  } else {
    authRequest()
  }
})
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
      return socket.emit(
        'enqueue',
        firebase.auth().currentUser.displayName,
        msg.data.route
      )
    case 'FETCH_QUEUE':
      return socket.emit('fetch_queue', msg.data.route)
    case 'REQUEST_AUTH_STATUS':
      return checkAuthStatus()
    case 'SIGN_IN':
      return startAuth()
  }
})

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query(activeTab, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'CLICKED_BROWSER_ACTION' })
  })
})

const activeTab = { active: true, currentWindow: true }

