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
import { onMounted, ref } from 'vue'

const message = ref('')
function logout() {}
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
