self.addEventListener('notificationclick', function(event) {
  const { action, notification } = event
  const taskId = notification.tag.split('-')[1]

  event.notification.close()

  if (action === 'complete') {
    // Handle mark complete action
    clients.openWindow(`/calendar?task=${taskId}&action=complete`)
  } else if (action === 'reschedule') {
    // Handle reschedule action
    clients.openWindow(`/calendar?task=${taskId}&action=reschedule`)
  } else {
    // Default action
    clients.openWindow(`/calendar?task=${taskId}`)
  }
})

self.addEventListener('push', function(event) {
  const data = event.data.json()

  const options = {
    body: data.body,
    icon: data.icon,
    tag: data.tag,
    requireInteraction: true,
    actions: data.actions
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})
