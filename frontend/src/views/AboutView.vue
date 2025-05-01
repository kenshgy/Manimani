<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
  <v-row>
    <v-col>
      <v-btn color="primary" block @click="logout" text="ログアウト"></v-btn>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      {{ message }}
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { getAuth } from 'firebase/auth'
import { onMounted, ref } from 'vue'

const message = ref('')
function logout() {
  const auth = getAuth()
  auth
    .signOut()
    .then(() => {
      message.value = 'ログアウトしました。'
    })
    .catch((error) => {
      console.error('Logout error:', error)
    })
}

onMounted(() => {
  const auth = getAuth()
  auth.onAuthStateChanged((user) => {
    if (user) {
      message.value = 'ログイン中: ' + user.email
    } else {
      message.value = 'ログインしていません。'
    }
  })
})
</script>
<style>
@media (min-width: 1024px) {
  .about {
    min-height: 50vh;
    display: flex;
    align-items: center;
  }
}
</style>
