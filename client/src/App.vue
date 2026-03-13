<template>
  <div class="app">
    <header class="header">
      <div class="header__left">
        <span class="header__logo">Realtime Board</span>
        <span class="header__status" :class="`header__status--${status}`">
          {{ statusLabel }}
        </span>
      </div>
      <div class="header__right">
        <span class="header__online">● {{ store.onlineCount }} online</span>
      </div>
    </header>

    <main class="board">
      <KanbanColumn
        v-for="col in columns"
        :key="col.id"
        :column="col.id"
        :label="col.label"
        :tasks="store.tasksByColumn(col.id)"
        @move="moveTask"
        @delete="deleteTask"
      />
    </main>

    <footer class="add-bar">
      <input
        v-model="newTitle"
        class="add-bar__input"
        placeholder="New task title…"
        @keydown.enter="submitTask"
      />
      <button class="add-bar__btn" :disabled="!newTitle.trim()" @click="submitTask">
        Add task
      </button>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useBoard } from '@/composables/useBoard'
import { useTasksStore } from '@/stores/useTasksStore'
import KanbanColumn from '@/components/KanbanColumn.vue'
import type { Column } from '@/types'

const columns: { id: Column; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

const store = useTasksStore()
const author = useLocalStorage('board-username', () => {
  const name = prompt('Enter your name:') ?? 'Anonymous'
  return name.trim() || 'Anonymous'
})

const { status, createTask, moveTask, deleteTask } = useBoard()

const statusLabel = computed(() => ({
  OPEN: 'Connected',
  CONNECTING: 'Connecting…',
  CLOSED: 'Disconnected',
}[status.value] ?? 'Connecting…'))

const newTitle = ref('')

function submitTask(): void {
  if (!newTitle.value.trim()) return
  createTask(newTitle.value.trim(), author.value)
  newTitle.value = ''
}
</script>

<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; }
</style>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; }

.header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 24px; height: 52px;
  background: #fff; border-bottom: 1px solid #e5e7eb; flex-shrink: 0;
}
.header__logo { font-weight: 700; font-size: 16px; color: #6366f1; margin-right: 12px; }
.header__left, .header__right { display: flex; align-items: center; gap: 12px; }
.header__status { font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 999px; }
.header__status--OPEN { background: #dcfce7; color: #16a34a; }
.header__status--CONNECTING { background: #fef9c3; color: #ca8a04; }
.header__status--CLOSED { background: #fee2e2; color: #dc2626; }
.header__online { font-size: 13px; color: #6b7280; }

.board { display: flex; gap: 16px; padding: 24px; flex: 1; overflow-x: auto; }

.add-bar {
  display: flex; gap: 8px; padding: 16px 24px;
  background: #fff; border-top: 1px solid #e5e7eb; flex-shrink: 0;
}
.add-bar__input {
  flex: 1; padding: 9px 12px; border: 1px solid #d1d5db;
  border-radius: 6px; font-size: 14px; outline: none;
}
.add-bar__input:focus { border-color: #6366f1; }
.add-bar__btn {
  padding: 9px 20px; background: #6366f1; color: #fff;
  border: none; border-radius: 6px; font-size: 14px; cursor: pointer;
}
.add-bar__btn:hover:not(:disabled) { background: #4f46e5; }
.add-bar__btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
