const socket = io.connect('http://localhost:8080', {
  query: { token: localStorage.getItem('meetqueue-token') },
})

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
      return fetchQueue(msg.data.route)
    case 'SIGN_IN':
      return authenticateUser()
  }
})

const getJwt = async (username) => {
  try {
    const res = await fetch(
      `http://localhost:8080/authenticate?username=${username}`
    )

    const token = await res.json()
    localStorage.setItem('meetqueue-token', token.token)
    authSuccess(username)
  } catch (e) {
    throw e
  }
}

const authenticateUser = async () => {
  return await getAccessToken((uri) => getUserInfo(uri).then(getJwt))
}

const fetchQueue = async (route) => {
  try {
    const res = await fetch(`http://localhost:8080/queue?route=${route}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('meetqueue-token')}`,
      },
    })

    const queue = await res.json()

    chrome.tabs.query(activeTab, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'FETCH_QUEUE_SUCCESS',
        data: queue,
      })
    })
  } catch (e) {
    throw e
  }
}

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query(activeTab, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'CLICKED_BROWSER_ACTION' })
  })
})

const activeTab = { active: true, currentWindow: true }
