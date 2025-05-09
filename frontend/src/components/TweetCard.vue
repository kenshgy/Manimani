<template>
  <v-card class="mb-4">
    <v-card-text>
      <p class="text-body-1">{{ tweet.text }}</p>
    </v-card-text>
    <v-card-subtitle class="text-caption text-right">
      {{ formatDate(tweet.created_at) }}
    </v-card-subtitle>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  tweet: {
    id: number
    text: string
    created_at: string
  }
}>()

function formatDate(datetime: string): string {
  const date = new Date(datetime)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
