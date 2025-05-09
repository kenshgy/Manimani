<template>
  <v-container class="py-0" fluid>
    <!-- ツイート投稿フォーム -->
    <v-card class="pa-4 mb-4">
      <v-textarea v-model="newTweet" label="いまどうしてる？" auto-grow outlined hide-details />
      <v-btn color="primary" class="mt-2" @click="postTweet">ポスト</v-btn>
    </v-card>

    <!-- ツイート一覧 -->
    <v-card v-for="tweet in tweets" :key="tweet.id" class="mb-4">
      <v-card-title>{{ tweet.user_name }}</v-card-title>
      <v-card-text>{{ tweet.text }}</v-card-text>
      <v-card-subtitle class="text-caption text-right">
        {{ formatDate(tweet.created_at) }}
      </v-card-subtitle>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'

const tweets = ref<Array<{ id: number; text: string; created_at: string; user_name: string }>>([])
const newTweet = ref('')

const fetchTweets = async () => {
  const { data, error } = await supabase
    .from('tweets')
    .select('id, text, created_at, user_name')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('ツイートの取得に失敗しました:', error)
  } else {
    tweets.value = data || []
  }
}

const postTweet = async () => {
  if (!newTweet.value.trim()) return

  const { error } = await supabase.from('tweets').insert([
    {
      text: newTweet.value,
      user_name: 'ユーザー名', // 実際にはログインユーザーの名前を使用
    },
  ])

  if (error) {
    console.error('ツイートの投稿に失敗しました:', error)
  } else {
    newTweet.value = ''
    await fetchTweets()
  }
}

const formatDate = (datetime: string): string => {
  const date = new Date(datetime)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(fetchTweets)
</script>
