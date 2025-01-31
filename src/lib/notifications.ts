export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications')
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export async function scheduleTaskReminder(task: {
  id: string
  title: string
  due_date: string
}) {
  if (!('Notification' in window)) return

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  const dueDate = new Date(task.due_date)
  const reminderTime = new Date(dueDate)
  reminderTime.setHours(dueDate.getHours() - 2) // 2 hours before due time

  const timeUntilReminder = reminderTime.getTime() - Date.now()
  if (timeUntilReminder <= 0) return // Don't schedule if already past

  setTimeout(() => {
    const notification = new Notification('Task Reminder', {
      body: `Task "${task.title}" is due in 2 hours. Would you like to mark it as complete or reschedule?`,
      icon: '/icons/icon-192x192.png',
      tag: `task-${task.id}`,
      requireInteraction: true,
      actions: [
        { action: 'complete', title: 'Mark Complete' },
        { action: 'reschedule', title: 'Reschedule' }
      ]
    })

    notification.addEventListener('click', () => {
      window.focus()
      window.location.href = `/calendar?task=${task.id}`
    })
  }, timeUntilReminder)
}

export function showTaskNotification(task: {
  id: string
  title: string
  due_date: string
}) {
  if (!('Notification' in window)) return
  
  return new Notification('Task Due Soon', {
    body: `Task "${task.title}" is due in 2 hours. Would you like to mark it as complete or reschedule?`,
    icon: '/icons/icon-192x192.png',
    tag: `task-${task.id}`,
    requireInteraction: true,
    actions: [
      { action: 'complete', title: 'Mark Complete' },
      { action: 'reschedule', title: 'Reschedule' }
    ]
  })
}
