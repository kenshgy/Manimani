<template>
  <!-- 利用規約ダイアログ -->
  <v-dialog
    :model-value="showTermsDialog"
    rounded="lg"
    max-width="600"
    @update:model-value="closeDialog"
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        利用規約
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text class="pa-6">
        <div class="terms-content">
          <h3 class="text-h6 mb-4">1. はじめに</h3>
          <p class="mb-4">
            この利用規約（以下「本規約」）は、当ファンクラブ（以下「当社」）が提供するサービス（以下「本サービス」）の利用条件を定めるものです。
          </p>

          <h3 class="text-h6 mb-4">2. 規約の適用</h3>
          <p class="mb-4">
            本規約は、本サービスの利用に関する当社と会員との間の権利義務関係を定めることを目的とし、会員と当社との間の本サービスの利用に関わる一切の関係に適用されます。
          </p>

          <h3 class="text-h6 mb-4">3. 会員登録</h3>
          <p class="mb-4">
            本サービスの利用を希望する者は、本規約の内容に同意した上で、当社の定める方法によって会員登録を申請するものとします。
          </p>
        </div>
      </v-card-text>
      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeDialog"> 閉じる </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps({
  showTermsDialog: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:showTermsDialog'])

const closeDialog = () => {
  emit('update:showTermsDialog', false)
}
</script>
