chrome.runtime.onMessage.addListener(function (msg) {
  switch (msg.type) {
    case 'CLICKED_BROWSER_ACTION':
      return toggleExtension()
    case 'ENQUEUED_SUCCESS':
      return createQueueItem(msg.data.user)
    case 'FETCH_QUEUE_SUCCESS':
      return msg.data.queue.map((q) => createQueueItem(q.username))
    case 'AUTH_SUCCESS':
      console.log('made it into content.js')
      return authSuccess()
    case 'AUTH_REQUEST':
      return authRequired()
  }
})
const requestAuthStatus = () => {
  chrome.runtime.sendMessage({
    type: 'REQUEST_AUTH_STATUS',
  })
}

const authRequired = () => {
  // Hide enqueue button
  const enqueueButton = document.getElementById('enqueue')
  enqueueButton.style.display = 'none'

  // Make sure auth button is visible
  const authButton = document.getElementById('auth-button')
  authButton.style.display = ''
}

const signInUser = () => {
  chrome.runtime.sendMessage({
    type: 'SIGN_IN',
  })
}

const authSuccess = () => {
  console.log('received auth success')
  // Make sure the enqueue button is visible
  const enqueueButton = document.getElementById('enqueue')
  enqueueButton.style.display = ''

  // Hide auth button
  const authButton = document.getElementById('auth-button')
  authButton.style.display = 'none'
}

const enqueueUser = () => {
  chrome.runtime.sendMessage({
    type: 'ENQUEUE',
    data: { route: window.location.pathname.substr(1) },
  })
}

const toggleExtension = () => {
  const queueOption = document.getElementById('extension-base')
  if (!queueOption) {
    initQueue()
  }
}
const initQueue = () => {
  // Determine if the user is signed in
  requestAuthStatus()

  // Attach queue options to the page
  buildQueueIcon()
}

const buildQueueIcon = () => {
  // Google Meet's icon bar in the top right
  const iconBar = document.getElementsByClassName('NzPR9b')[0]

  // Our addition to the icon bar
  const extension = document.createElement('div')
  extension.setAttribute('id', 'extension-base')

  // Button to show and hide queue
  const showQueueButton = document.createElement('button')
  showQueueButton.innerText = 'Show Queue'
  showQueueButton.setAttribute('id', 'toggle-queue')
  showQueueButton.addEventListener('click', toggleQueue)

  // attach button and extension to page
  extension.append(showQueueButton)
  iconBar.append(extension)

  // Request data and add it to the DOM
  buildQueue()
}

const toggleQueue = () => {
  // The queue display
  const dropdown = document.getElementById('queue-dropdown')

  // The Show/Hide queue button
  const toggleButton = document.getElementById('toggle-queue')

  if (dropdown.style.display === 'none') {
    dropdown.style.display = ''
    toggleButton.innerText = 'Hide Queue'
  } else {
    dropdown.style.display = 'none'
    toggleButton.innerText = 'Show Queue'
  }
}

const fetchQueue = () => {
  chrome.runtime.sendMessage({
    type: 'FETCH_QUEUE',
    data: { route: window.location.pathname.substr(1) },
  })
}
const buildQueue = () => {
  // The dropdown that shows the current queue
  const dropdown = document.createElement('div')
  dropdown.setAttribute('id', 'queue-dropdown')
  dropdown.style.position = 'absolute'
  dropdown.style.display = 'none'
  dropdown.style.backgroundColor = 'white'

  // The queue list
  const queueList = document.createElement('ul')
  queueList.style.listStyleType = 'none'
  queueList.style.paddingLeft = '5px'
  queueList.setAttribute('id', 'queue')
  dropdown.append(queueList)

  // Button to sign in
  const authButton = document.createElement('button')
  authButton.setAttribute('id', 'auth-button')
  authButton.innerText = 'Sign in to join the queue'
  authButton.addEventListener('click', signInUser)
  dropdown.append(authButton)

  // The button to add yourself to the queue
  const enqueueButton = document.createElement('button')
  enqueueButton.setAttribute('id', 'enqueue')
  enqueueButton.innerText = 'Raise hand'
  enqueueButton.addEventListener('click', enqueueUser)
  dropdown.append(enqueueButton)

  // Add the dropdown to the DOM
  document.getElementById('extension-base').append(dropdown)

  // Fetch data to populate it
  fetchQueue()
}

const createQueueItem = (value) => {
  const li = document.createElement('li')
  li.innerHTML = value
  document.getElementById('queue').append(li)
}
