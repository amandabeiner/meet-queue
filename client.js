// const socket = io.connect('http://localhost:8080')
// socket.on('received_reservations', function (reservations) {
//   reservations.forEach((r) => {
//     createListItem(r.username)
//   })
// })
//
// socket.on('enqueue', function (username) {
//   createListItem(username)
// })

const createListItem = (value) => {
  li = document.createElement('li')
  li.innerHTML = value
  document.getElementById('queue').append(li)
}

const initQueue = () => {
  // socket.emit('request_reservations')
  document.getElementById('enqueue').addEventListener('click', () => {
    socket.emit('enqueue')
  })
}

window.onload = () => initQueue()
