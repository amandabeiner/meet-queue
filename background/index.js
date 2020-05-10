const socket = io.connect('http://localhost:8080')
const authSuccess = (user) => {
  socket.emit('auth_success', user.name)
  chrome.tabs.query({ url: 'https://meet.google.com/*' }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'AUTH_SUCCESS',
    })
  })
}

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
      return socket.emit('enqueue', msg.data.route)
    case 'FETCH_QUEUE':
      return socket.emit('fetch_queue', msg.data.route)
    case 'SIGN_IN':
      return authenticateUser()
  }
})

const authenticateUser = () => {
  return getAccessToken((uri) => getUserInfo(uri).then(authSuccess))
}

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query(activeTab, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'CLICKED_BROWSER_ACTION' })
  })
})

const activeTab = { active: true, currentWindow: true }
