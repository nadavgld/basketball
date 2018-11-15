self.addEventListener('push', e => {
    const data = e.data.json()

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://hoops4life.com.au/wp-content/uploads/basketball-icon.png'
    })
})