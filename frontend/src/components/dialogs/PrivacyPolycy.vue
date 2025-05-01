<template>
  <!-- プライバシーポリシーダイアログ -->
  <v-dialog
    :model-value="showPrivacyDialog"
    rounded="lg"
    max-width="600"
    @update:model-value="closeDialog"
  >
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        プライバシーポリシー
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text class="pa-6">
        <div class="privacy-content">
          <h3 class="text-h6 mb-4">1. 個人情報の収集</h3>
          <p class="mb-4">
            当社は、本サービスの提供にあたり、以下の個人情報を収集する場合があります：
          </p>
          <ul class="mb-4">
            <li>氏名</li>
            <li>メールアドレス</li>
            <li>生年月日</li>
            <li>住所</li>
            <li>電話番号</li>
          </ul>

          <h3 class="text-h6 mb-4">2. 個人情報の利用目的</h3>
          <p class="mb-4">収集した個人情報は、以下の目的で利用いたします：</p>
          <ul class="mb-4">
            <li>会員登録及び本人確認</li>
            <li>サービスの提供及び運営</li>
            <li>お問い合わせ対応</li>
            <li>キャンペーン等の案内</li>
          </ul>
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
  showPrivacyDialog: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:showPrivacyDialog'])

const closeDialog = () => {
  emit('update:showPrivacyDialog', false)
}
</script>
