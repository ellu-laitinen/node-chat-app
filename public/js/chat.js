//this is client side

const socket = io()

/* socket.on('countUpdated', (count) => {  //name must match to server's socket.emit event name
    console.log('the count has been updated', count)
})

document.querySelector('#increment').addEventListener('click', () => {
    console.log('clicked')
    socket.emit('increment')
}) */
const $msgForm = document.querySelector('#msg-form')
const $msgFormInput = $msgForm.querySelector('input')
const $msgFormBtn = $msgForm.querySelector('button')
const $locationBtn = document.querySelector('#location-btn')
const $messages = document.querySelector('#messages')

// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight

    }

}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('dddd, MMMM Do YYYY k:mm:ss')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('dddd, MMMM Do YYYY k:mm:ss')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$msgForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $msgFormBtn.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value  //target means the element that we are listenin, in this case the mgs-form

    socket.emit('sendMessage', message, (error) => {
        $msgFormBtn.removeAttribute('disabled')
        $msgFormInput.value = ''
        $msgFormInput.focus()


        if (error) {
            return console.log(error)
        }

        console.log('message delivered')
    })
})

$locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is no supported by your browser.')
    }
    $locationBtn.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared')
            $locationBtn.removeAttribute('disabled')
        })
    })

})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})