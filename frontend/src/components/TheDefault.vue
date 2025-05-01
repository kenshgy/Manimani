<script setup lang="ts">
import { RouterView } from 'vue-router'
import TheHeader from './TheHeader.vue'
import TheFooter from './TheFooter.vue'
</script>

<template>
  <TheHeader />
  <v-main>
    <RouterView />
  </v-main>
  <!-- <TheFooter /> -->
</template>
