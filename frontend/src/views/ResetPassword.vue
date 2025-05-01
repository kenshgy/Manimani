<template>
  <v-row class="mt-10">
    <v-col cols="1" md="4"> </v-col>
    <v-col cols="10" md="4">
      <v-card class="pa-4" rounded="lg">
        <v-card-title class="text-h5">パスワードをリセット</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="resetPassword">
            <v-text-field
              label="メールアドレス"
              v-model="email"
              required
              variant="underlined"
              :prepend-inner-icon="mdiEmailOutline"
              autocomplete="email"
            />
            <v-btn type="submit" color="primary" block>パスワードをリセット</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="1" md="4"></v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import { mdiEmailOutline } from '@mdi/js'

const email = ref('')

const resetPassword = async () => {
  try {
    await sendPasswordResetEmail(auth, email.value)
    alert('パスワードリセットメールを送信しました。')
  } catch (error) {
    console.error('パスワードリセットエラー:', error)
    alert('パスワードリセットに失敗しました。')
  }
}
</script>
