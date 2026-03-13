<template>
  <div
    class="column"
    :class="{ 'column--over': isDragOver }"
    @dragover.prevent="isDragOver = true"
    @dragleave="isDragOver = false"
    @drop="onDrop"
  >
    <div class="column__header">
      <span class="column__title">{{ label }}</span>
      <span class="column__count">{{ tasks.length }}</span>
    </div>

    <TransitionGroup name="card" tag="div" class="column__cards">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @delete="$emit('delete', $event)"
      />
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { Task, Column } from '@/types'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  column: Column
  label: string
  tasks: Task[]
}>()

const emit = defineEmits<{
  move: [id: string, column: Column]
  delete: [id: string]
}>()

const isDragOver = ref(false)

function onDrop(e: DragEvent): void {
  isDragOver.value = false
  const taskId = e.dataTransfer?.getData('taskId')
  if (taskId) emit('move', taskId, props.column)
}
</script>

<style scoped>
.column {
  flex: 1;
  min-width: 260px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: background 0.15s;
}
.column--over { background: #e0e7ff; }
.column__header { display: flex; justify-content: space-between; align-items: center; }
.column__title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
.column__count { font-size: 12px; font-weight: 600; background: #e5e7eb; color: #6b7280; border-radius: 999px; padding: 1px 8px; }
.column__cards { display: flex; flex-direction: column; gap: 8px; min-height: 40px; }

.card-enter-active, .card-leave-active { transition: all 0.2s ease; }
.card-enter-from { opacity: 0; transform: translateY(-8px); }
.card-leave-to { opacity: 0; transform: scale(0.95); }
</style>
