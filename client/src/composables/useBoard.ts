import { watch } from 'vue'
import { useWebSocket } from '@vueuse/core'
import { useTasksStore } from '@/stores/useTasksStore'
import type { Task, Column, WsMessage } from '@/types'

const WS_URL = import.meta.env.VITE_WS_URL as string

export function useBoard() {
  const store = useTasksStore()

  // useWebSocket handles reconnect and heartbeat automatically —
  // no need to manage WebSocket lifecycle manually
  const { data, send, status } = useWebSocket(WS_URL, {
    autoReconnect: { retries: 10, delay: 2000 },
    heartbeat: { message: 'ping', interval: 30_000 },
  })

  watch(data, (raw: string | null) => {
    if (!raw || raw === 'pong') return

    let message: WsMessage
    try {
      message = JSON.parse(raw) as WsMessage
    } catch {
      return
    }

    switch (message.type) {
      case 'state:sync':
        store.syncState(message.payload)
        break
      case 'task:create':
        store.addTask(message.payload)
        break
      case 'task:move':
        store.moveTask(message.payload.id, message.payload.column)
        break
      case 'task:delete':
        store.deleteTask(message.payload.id)
        break
      case 'online:update':
        store.setOnlineCount(message.payload.count)
        break
    }
  })

  function sendMessage(message: WsMessage): void {
    send(JSON.stringify(message))
  }

  function createTask(title: string, author: string): void {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      column: 'todo',
      author,
    }
    store.addTask(task)
    sendMessage({ type: 'task:create', payload: task })
  }

  function moveTask(id: string, column: Column): void {
    store.moveTask(id, column)
    sendMessage({ type: 'task:move', payload: { id, column } })
  }

  function deleteTask(id: string): void {
    store.deleteTask(id)
    sendMessage({ type: 'task:delete', payload: { id } })
  }

  return { status, createTask, moveTask, deleteTask }
}
