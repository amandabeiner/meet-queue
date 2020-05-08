chrome.runtime.onMessage.addListener(function (msg) {
  console.log('receiving a message', msg)
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
  const iconBar = document.getElementsByClassName('NzPR9b')[0]
  const div = document.createElement('div')
  div.setAttribute('id', 'queue-base')
  const button = document.createElement('button')
  button.innerText = 'See Queue'
  button.addEventListener('click', initQueue)
  div.append(button)
  iconBar.append(div)
}

const initQueue = () => {
  showQueue()
  fetchQueue()
}

const fetchQueue = () => {
  chrome.runtime.sendMessage({
    type: 'FETCH_QUEUE',
    data: { route: window.location.pathname.substr(1) },
  })
}
const showQueue = () => {
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.backgroundColor = 'white'

  const ul = document.createElement('ul')
  ul.setAttribute('id', 'queue')

  const button = document.createElement('button')
  button.setAttribute('id', 'enqueue')
  button.innerText = 'Raise hand'

  button.addEventListener('click', enqueueUser)

  container.append(ul)
  container.append(button)
  document.getElementById('queue-base').append(container)
}

const createQueueItem = (value) => {
  console.log('about to create item')
  const li = document.createElement('li')
  li.innerHTML = value
  document.getElementById('queue').append(li)
}

