chrome.runtime.onMessage.addListener(function (msg) {
  switch (msg.type) {
    case 'CLICKED_BROWSER_ACTION':
      return addQueueIcon()
    case 'ENQUEUED_SUCCESS':
      return createQueueItem(msg.data.user)
    case 'FETCH_QUEUE_SUCCESS':
      return msg.data.queue.map((q) => createQueueItem(q.username))
  }
})

const enqueueUser = () => {
  chrome.runtime.sendMessage({
    type: 'ENQUEUE',
    data: { user: 'Amanda Beiner', route: window.location.pathname.substr(1) },
  })
}

const addQueueIcon = () => {
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
  console.log('in toggleQueue')
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

  // The button to add yourself to the queue
  const enqueueButton = document.createElement('button')
  enqueueButton.setAttribute('id', 'enqueue')
  enqueueButton.innerText = 'Raise hand'
  enqueueButton.addEventListener('click', enqueueUser)

  // Add the dropdown to the DOM
  dropdown.append(queueList)
  dropdown.append(enqueueButton)
  document.getElementById('extension-base').append(dropdown)

  // Fetch data to populate it
  fetchQueue()
}

const createQueueItem = (value) => {
  const li = document.createElement('li')
  li.innerHTML = value
  document.getElementById('queue').append(li)
}

