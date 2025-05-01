]
<template>
  <v-container>
    <v-tabs v-model="selectedChannel">
      <v-tab v-for="channel in channels" :key="channel.value" :value="channel.value">
        {{ channel.name }}
      </v-tab>
    </v-tabs>

    <v-row>
      <v-col cols="12" class="mt-4 pb-0">
        <v-textarea
          v-model="newMessage"
          label="Write your message"
          variant="outlined"
          density="compact"
          rows="3"
        ></v-textarea>
        <!-- <v-img v-if="selectedImage" :src="selectedImage" max-height="200" contain /> -->
      </v-col>
      <!-- <v-col cols="6" class="py-0">
        <v-btn :icon="mdiImage" variant="plain" @click="openFilePicker"></v-btn>
        <input type="file" accept="image/*" hidden @change="handleImageUpload" ref="fileInput" />
      </v-col> -->
      <v-col></v-col>
      <v-spacer></v-spacer>
      <v-col cols="3" class="py-0">
        <v-btn color="primary" @click="postMessage" block variant="plain">Post</v-btn>
      </v-col>
    </v-row>
    <v-row class="mt-2">
      <v-col cols="12" v-for="message in messages" :key="message.id">
        <v-row>
          <v-col cols="12" class="pt-0">
            <v-divider></v-divider>
          </v-col>
          <v-col cols="6">
            {{ message.username }}
          </v-col>
          <v-col cols="6">
            <small>
              {{ new Date(message.timestamp).toLocaleDateString('en-US') }}
            </small>
          </v-col>
          <v-col>
            {{ message.text }}
            <v-img v-if="message.imageUrl" :src="message.imageUrl" max-height="200" contain />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref as vueRef, onMounted, onUnmounted, watch } from 'vue'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  getDoc,
  doc,
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import { getStorage, uploadBytes, getDownloadURL, ref } from 'firebase/storage'

interface Message {
  id: string
  text: string
  username: string
  userId: string
  timestamp: Date
  imageUrl?: string
}

const newMessage = vueRef('')
const selectedChannel = vueRef('general')
const messages = vueRef<Message[]>([])
const channels = vueRef([
  { name: '一般', value: 'general' },
  { name: '門前', value: 'monzen' },
  { name: 'ランダム', value: 'random' },
])
const selectedImage = vueRef<string | null>(null)
const imageFile = vueRef<File | null>(null)
const storage = getStorage()

const postMessage = async () => {
  if (newMessage.value.trim() === '' && imageFile.value === null) return

  try {
    if (auth.currentUser) {
      let imageUrl = null

      if (imageFile.value) {
        const storageRef = ref(storage, `images/${auth.currentUser.uid}/${imageFile.value.name}`)
        await uploadBytes(storageRef, imageFile.value)
        imageUrl = await getDownloadURL(storageRef)
      }

      await addDoc(collection(db, 'messages'), {
        text: newMessage.value,
        channel: selectedChannel.value,
        username: auth.currentUser.displayName || 'Anonymous',
        userId: auth.currentUser.uid,
        timestamp: new Date(),
        imageUrl: imageUrl,
      })
      newMessage.value = ''
      selectedImage.value = null
      imageFile.value = null
    } else {
      console.error('No user logged in')
    }
  } catch (error) {
    console.error('Error adding message:', error)
  }
}

const getMessages = async () => {
  const q = query(
    collection(db, 'messages'),
    where('channel', '==', selectedChannel.value),
    orderBy('timestamp', 'desc'),
  )

  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    messages.value = await Promise.all(
      querySnapshot.docs.map(async (messageDoc) => {
        const data = messageDoc.data()
        const userId = data ? data.userId : null
        const userDoc = userId ? await getDoc(doc(db, 'profiles', userId)) : null
        const userData = userDoc ? userDoc.data() : null
        const username = (
          userDoc &&
          userData &&
          typeof userData === 'object' &&
          userData !== null &&
          'nickname' in userData &&
          userData.nickname !== ''
            ? userData.nickname
            : 'Anonymous'
        ) as string
        return {
          id: messageDoc.id,
          text: data.text,
          username: username,
          userId: userId,
          timestamp: data.timestamp?.toDate(),
          imageUrl: data.imageUrl,
        }
      }),
    )
  })

  onUnmounted(() => {
    unsubscribe()
  })
}

onMounted(() => {
  getMessages()
})

watch(selectedChannel, () => {
  getMessages()
})
</script>

<style scoped></style>
