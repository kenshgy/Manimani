import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export function useTweets() {
  const tweets = ref<{ id: number; text: string; created_at: string }[]>([])
  const loading = ref(false)

  const fetchTweets = async () => {
    loading.value = true
    const { data, error } = await supabase
      .from('tweets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      tweets.value = data || []
    }
    loading.value = false
  }

  const postTweet = async (text: string) => {
    const { error } = await supabase.from('tweets').insert([{ text }])
    if (error) {
      console.error(error)
    } else {
      await fetchTweets()
    }
  }

  return {
    tweets,
    loading,
    fetchTweets,
    postTweet,
  }
}
