export type Column = 'todo' | 'in-progress' | 'done'

export interface Task {
  id: string
  title: string
  column: Column
  author: string
}

export type WsMessage =
  | { type: 'task:create'; payload: Task }
  | { type: 'task:update'; payload: Partial<Task> & { id: string } }
  | { type: 'task:move'; payload: { id: string; column: Column } }
  | { type: 'task:delete'; payload: { id: string } }
  | { type: 'user:join'; payload: { name: string } }
  | { type: 'state:sync'; payload: { tasks: Task[]; onlineCount: number } }
  | { type: 'online:update'; payload: { count: number } }
