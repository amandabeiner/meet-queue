chrome.runtime.onMessage.addListener(function (msg) {
  switch (msg.type) {
    case 'CLICKED_BROWSER_ACTION':
      return toggleExtension()
    case 'ENQUEUED_SUCCESS':
      return createQueueItem(msg.data.user)
    case 'FETCH_QUEUE_SUCCESS':
      return msg.data.queue.map((q) => createQueueItem(q.username))
    case 'AUTH_SUCCESS':
      return authSuccess()
  }
})

const signInUser = () => {
  chrome.runtime.sendMessage({
    type: 'SIGN_IN',
  })
}

const authSuccess = () => {
  // Make sure the enqueue button is visible
  const enqueueButton = document.getElementById('enqueue')
  enqueueButton.setAttribute('class', 'block')

  // Hide auth button
  const authButton = document.getElementById('auth-button')
  authButton.setAttribute('class', 'hidden')
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
  signInUser()

  // Attach queue options to the page
  buildQueueIcon()
}

const buildQueueIcon = () => {
  // Google Meet's icon bar in the top right
  const iconBar = document.getElementsByClassName('NzPR9b')[0]

  // Our addition to the icon bar
  const extension = document.createElement('div')
  extension.setAttribute('id', 'extension-base')
  extension.setAttribute('class', 'flex flex-col justify-center')

  // Button to show and hide queue
  const showQueueButton = document.createElement('input')
  showQueueButton.type = 'image'
  showQueueButton.src = chrome.extension.getURL('icon-gray.png')
  showQueueButton.setAttribute('class', 'h-6 mx-4')

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

  const queueIsHidden = dropdown.className.includes('hidden')
  if (queueIsHidden) {
    dropdown.setAttribute('class', dropdownVisibleStyles)
    toggleButton.src = chrome.extension.getURL('icon-green.png')
  } else {
    dropdown.setAttribute('class', dropdownHiddenStyles)
    toggleButton.src = chrome.extension.getURL('icon-gray.png')
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
  dropdown.setAttribute('class', 'absolute hidden bg-white')

  // Heading
  const heading = document.createElement('h1')
  heading.innerText = 'Next Up'

  // The queue list
  const queueList = document.createElement('ul')
  queueList.setAttribute('class', 'list-none px-4')
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
  enqueueButton.setAttribute('class', 'hidden')
  enqueueButton.innerText = 'Raise hand'
  enqueueButton.addEventListener('click', enqueueUser)
  dropdown.append(enqueueButton)

  // A container for all of the above
  const anchor = document.createElement('div')
  const extension = document.getElementById('extension-base')
  extension.append(anchor)
  // Add the dropdown to the DOM
  anchor.append(dropdown)

  // Fetch data to populate it
  fetchQueue()
}

const createQueueItem = (value) => {
  const li = document.createElement('li')
  li.innerHTML = value
  document.getElementById('queue').append(li)
}
