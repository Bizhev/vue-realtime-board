<template>
  <div
    class="card"
    draggable="true"
    @dragstart="onDragStart"
  >
    <p class="card__title">{{ task.title }}</p>
    <div class="card__footer">
      <span class="card__author">{{ task.author }}</span>
      <button class="card__delete" title="Delete" @click.stop="$emit('delete', task.id)">✕</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Task } from '@/types'

const props = defineProps<{ task: Task }>()
defineEmits<{ delete: [id: string] }>()

function onDragStart(e: DragEvent): void {
  e.dataTransfer!.setData('taskId', props.task.id)
  e.dataTransfer!.effectAllowed = 'move'
}
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  cursor: grab;
  transition: box-shadow 0.15s;
}
.card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.card:active { cursor: grabbing; }
.card__title { margin: 0 0 10px; font-size: 14px; color: #111827; line-height: 1.4; }
.card__footer { display: flex; justify-content: space-between; align-items: center; }
.card__author { font-size: 11px; color: #9ca3af; }
.card__delete {
  background: none; border: none; cursor: pointer;
  font-size: 12px; color: #d1d5db; padding: 0 2px;
}
.card__delete:hover { color: #ef4444; }
</style>
