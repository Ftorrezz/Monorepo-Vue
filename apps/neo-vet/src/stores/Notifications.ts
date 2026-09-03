import { defineStore } from 'pinia'

export type NotificationItem = {
  id: string | number
  title: string
  message?: string
  date?: string
  read?: boolean
  payload?: any
}

export const useNotificationsStore = defineStore('useNotificationsStore', {
  state: () => ({
    notifications: [] as NotificationItem[],
    focusId: null as null | string | number
  }),
  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
    all: (state) => state.notifications
  },
  actions: {
    pushNotification(item: NotificationItem) {
      this.notifications.unshift({ ...item, read: false, date: item.date || new Date().toISOString() })
    },
    focusNotification(id: string | number) {
      this.focusId = id
      setTimeout(() => { this.focusId = null }, 5000)
    },
    markRead(id: string | number) {
      const i = this.notifications.find(n => n.id === id)
      if (i) i.read = true
    },
    markAllRead() {
      this.notifications.forEach(n => n.read = true)
    },
    remove(id: string | number) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    },
    clear() { this.notifications = [] }
  },
  persist: true
})
