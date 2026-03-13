import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, Column } from '@/types'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const onlineCount = ref(0)

  const tasksByColumn = computed(() => (column: Column) =>
    tasks.value.filter((t) => t.column === column)
  )

  function syncState(payload: { tasks: Task[]; onlineCount: number }): void {
    tasks.value = payload.tasks
    onlineCount.value = payload.onlineCount
  }

  function addTask(task: Task): void {
    tasks.value.push(task)
  }

  function moveTask(id: string, column: Column): void {
    const task = tasks.value.find((t) => t.id === id)
    if (task) task.column = column
  }

  function deleteTask(id: string): void {
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  function setOnlineCount(count: number): void {
    onlineCount.value = count
  }

  return { tasks, onlineCount, tasksByColumn, syncState, addTask, moveTask, deleteTask, setOnlineCount }
})
