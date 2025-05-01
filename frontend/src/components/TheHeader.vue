<template>
  <v-app-bar>
    <v-app-bar-title>
      <v-btn text="NotoClub" @click="$router.push('/home')"></v-btn>
    </v-app-bar-title>

    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn :icon="mdiAccount" v-bind="props"> </v-btn>
      </template>

      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index">
          <!-- <v-list-item-title @click="item.function">{{ item.title }}</v-list-item-title> -->
          <v-btn :text="item.title" @click="item.function" variant="plain"> </v-btn>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>
<script setup lang="ts">
import { getAuth } from 'firebase/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mdiAccount } from '@mdi/js'

const router = useRouter()
const status = ref('')
const items = [
  {
    title: 'マイページ',
    function: () => {
      router.push('/account')
    },
  },
  {
    title: 'ホーム',
    function: () => {
      router.push('/home')
    },
  },
]

onMounted(() => {
  const auth = getAuth()
  auth.onAuthStateChanged((user) => {
    if (user) {
      status.value = 'ようこそ ' + user.email
    } else {
      status.value = ''
    }
  })
})
</script>
