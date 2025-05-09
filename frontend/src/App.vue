<script setup>
import { RouterView } from 'vue-router'
import { supabase } from './utils/supabase'
</script>

<template>
  <v-app>
    <RouterView />
  </v-app>
</template>
