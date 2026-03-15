# vue-realtime-board

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)
![VueUse](https://img.shields.io/badge/VueUse-useWebSocket-41b883)
![Pinia](https://img.shields.io/badge/Pinia-2-f7d336?logo=pinia)

**[Live demo](https://bizhev.github.io/vue-realtime-board/)**

Kanban board with real-time sync across browser tabs via WebSocket — the same pattern used in production at МС ДИАС.

Open the demo in two tabs and move a card: both update instantly.

---

## Architecture

```
Client A ──┐
           ├──▶  WebSocket Server  ──▶  broadcast  ──▶  Client B, C
Client B ──┘         (Node.js / ws)
```

```
client/
├── src/composables/useBoard.ts     ← useWebSocket + message dispatch
├── src/stores/useTasksStore.ts     ← Pinia — single source of truth
└── src/components/
    ├── KanbanColumn.vue            ← drag-and-drop drop target
    └── TaskCard.vue                ← draggable card

server/
└── src/index.ts                   ← WebSocket server, broadcast, state sync
```

---

## What this demonstrates

| Concept | Implementation |
|---------|---------------|
| WebSocket real-time sync | `useWebSocket` from VueUse — all clients receive broadcast on any change |
| Typed message protocol | Discriminated union `WsMessage` — exhaustive `switch` prevents unhandled cases |
| `useWebSocket` vs `new WebSocket()` | Auto-reconnect (`retries: 10`), heartbeat ping every 30s — no manual lifecycle |
| Pinia as shared state | Store updated by both local actions and incoming WS messages |
| State sync on connect | Server sends `state:sync` on new connection — client always gets current board |
| Drag and drop | Native HTML5 DnD API — no extra dependency |

---

## useWebSocket vs new WebSocket()

```typescript
// manual WebSocket — you manage reconnect, heartbeat, cleanup
const ws = new WebSocket(url)
ws.onclose = () => setTimeout(() => reconnect(), 2000) // ...manual reconnect logic

// useWebSocket — handled automatically
const { data, send, status } = useWebSocket(WS_URL, {
  autoReconnect: { retries: 10, delay: 2000 },
  heartbeat: { message: 'ping', interval: 30_000 },
})
```

`status` is reactive — the UI shows Connected / Connecting / Disconnected without extra code.

---

## Typed messages — discriminated union

```typescript
type WsMessage =
  | { type: 'task:create'; payload: Task }
  | { type: 'task:move';   payload: { id: string; column: Column } }
  | { type: 'task:delete'; payload: { id: string } }
  | { type: 'state:sync';  payload: { tasks: Task[]; onlineCount: number } }

// TypeScript narrows payload type in each branch
switch (message.type) {
  case 'task:move':
    store.moveTask(message.payload.id, message.payload.column) // fully typed
    break
}
```

Adding a new message type causes a compile error at every unhandled `switch` — catches integration bugs at build time.

---

## Getting started

```bash
# server
cd server && npm install && npm run dev   # ws://localhost:8080

# client (new terminal)
cd client && npm install
echo "VITE_WS_URL=ws://localhost:8080" > .env.local
npm run dev                               # http://localhost:5173
```

## Server deploy (Render)

1. New Web Service → connect repo → Root directory: `server`
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Copy the service URL (e.g. `wss://vue-realtime-board-server.onrender.com`)
5. GitHub → Settings → Secrets → `VITE_WS_URL` = `wss://vue-realtime-board-server.onrender.com`
