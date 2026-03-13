import { WebSocketServer, WebSocket } from 'ws'
import type { Task, WsMessage } from './types'

const PORT = Number(process.env.PORT) || 8080

const wss = new WebSocketServer({ port: PORT })

// Shared state — in production this would be a database
const tasks: Task[] = [
  { id: '1', title: 'Set up WebSocket server', column: 'done', author: 'System' },
  { id: '2', title: 'Build Kanban UI', column: 'in-progress', author: 'System' },
  { id: '3', title: 'Add drag and drop', column: 'todo', author: 'System' },
]

function broadcast(message: WsMessage, exclude?: WebSocket): void {
  const data = JSON.stringify(message)
  wss.clients.forEach((client) => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

function broadcastAll(message: WsMessage): void {
  broadcast(message)
}

wss.on('connection', (ws) => {
  // Send current state to the new client
  ws.send(JSON.stringify({
    type: 'state:sync',
    payload: { tasks, onlineCount: wss.clients.size },
  } satisfies WsMessage))

  // Notify all clients about new online count
  broadcastAll({ type: 'online:update', payload: { count: wss.clients.size } })

  ws.on('message', (raw) => {
    let message: WsMessage

    try {
      message = JSON.parse(raw.toString()) as WsMessage
    } catch {
      return
    }

    switch (message.type) {
      case 'task:create':
        tasks.push(message.payload)
        broadcast(message, ws)
        break

      case 'task:update': {
        const idx = tasks.findIndex((t) => t.id === message.payload.id)
        if (idx !== -1) Object.assign(tasks[idx], message.payload)
        broadcast(message, ws)
        break
      }

      case 'task:move': {
        const task = tasks.find((t) => t.id === message.payload.id)
        if (task) task.column = message.payload.column
        broadcast(message, ws)
        break
      }

      case 'task:delete': {
        const idx = tasks.findIndex((t) => t.id === message.payload.id)
        if (idx !== -1) tasks.splice(idx, 1)
        broadcast(message, ws)
        break
      }

      case 'user:join':
        broadcast(message, ws)
        break
    }
  })

  ws.on('close', () => {
    broadcastAll({ type: 'online:update', payload: { count: wss.clients.size } })
  })
})

console.log(`WebSocket server running on ws://localhost:${PORT}`)
