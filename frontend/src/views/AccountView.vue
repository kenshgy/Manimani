<template>
  <v-container>
    <v-row>
      <v-col cols="4"></v-col>
      <v-col cols="4" class="text-center">
        <h3>マイページ</h3>
      </v-col>
      <v-col cols="4" class="text-right">
        <v-btn @click.stop="logout(router)" variant="plain">ログアウト</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="1" md="3"> </v-col>
      <v-col cols="10" md="6">
        <v-row>
          <v-col cols="12" md="6" class="py-0">
            <v-text-field
              v-model="profile.familyName"
              label="姓"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="6" class="py-0">
            <v-text-field
              v-model="profile.firstName"
              label="名"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="6" class="py-0">
            <v-text-field
              v-model="address.postalCode"
              label="郵便番号"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="6" class="py-0"></v-col>
          <v-col cols="12" md="6" class="py-0">
            <v-select
              v-model="address.prefecture"
              :items="prefectures"
              item-title="label"
              item-value="value"
              label="都道府県名"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cls="12" md="6" class="py-0">
            <v-text-field
              v-model="address.city"
              label="市区町村"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="6" class="py-0">
            <v-text-field
              v-model="address.street"
              label="番地"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="6" class="py-0">
            <v-text-field
              v-model="address.division"
              label="建物名、部屋番号など"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" class="py-0">
            <v-text-field
              v-model="profile.phoneNumber"
              label="電話番号"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" class="py-0">
            <v-text-field
              v-model="profile.nickname"
              label="ニックネーム"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col class="py-0">
            <v-btn @click="saveProfile" color="primary" block>保存</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ProfileType } from '../types/ProfileType'
import type { AddressType } from '../types/AddressType'

const router = useRouter()
const message = ref('')
const address = reactive<AddressType>({
  postalCode: '',
  prefecture: '',
  city: '',
  street: '',
  division: '',
})
const profile = reactive<ProfileType>({
  familyName: '',
  firstName: '',
  phoneNumber: '',
  nickname: '',
})

const prefectures = [
  { label: '北海道', value: 'hokkaido' },
  { label: '青森県', value: 'aomori' },
  { label: '岩手県', value: 'iwate' },
  { label: '宮城県', value: 'miyagi' },
  { label: '秋田県', value: 'akita' },
  { label: '山形県', value: 'yamagata' },
  { label: '福島県', value: 'fukushima' },
  { label: '茨城県', value: 'ibaraki' },
  { label: '栃木県', value: 'tochigi' },
  { label: '群馬県', value: 'gunma' },
  { label: '埼玉県', value: 'saitama' },
  { label: '千葉県', value: 'chiba' },
  { label: '東京都', value: 'tokyo' },
  { label: '神奈川県', value: 'kanagawa' },
  { label: '新潟県', value: 'niigata' },
  { label: '富山県', value: 'toyama' },
  { label: '石川県', value: 'ishikawa' },
  { label: '福井県', value: 'fukui' },
  { label: '山梨県', value: 'yamanashi' },
  { label: '長野県', value: 'nagano' },
  { label: '岐阜県', value: 'gifu' },
  { label: '静岡県', value: 'shizuoka' },
  { label: '愛知県', value: 'aichi' },
  { label: '三重県', value: 'mie' },
  { label: '滋賀県', value: 'shiga' },
  { label: '京都府', value: 'kyoto' },
  { label: '大阪府', value: 'osaka' },
  { label: '兵庫県', value: 'hyogo' },
  { label: '奈良県', value: 'nara' },
  { label: '和歌山県', value: 'wakayama' },
  { label: '鳥取県', value: 'tottori' },
  { label: '島根県', value: 'shimane' },
  { label: '岡山県', value: 'okayama' },
  { label: '広島県', value: 'hiroshima' },
  { label: '山口県', value: 'yamaguchi' },
  { label: '徳島県', value: 'tokushima' },
  { label: '香川県', value: 'kagawa' },
  { label: '愛媛県', value: 'ehime' },
  { label: '高知県', value: 'kochi' },
  { label: '福岡県', value: 'fukuoka' },
  { label: '佐賀県', value: 'saga' },
  { label: '長崎県', value: 'nagasaki' },
  { label: '熊本県', value: 'kumamoto' },
  { label: '大分県', value: 'oita' },
  { label: '宮崎県', value: 'miyazaki' },
  { label: '鹿児島県', value: 'kagoshima' },
  { label: '沖縄県', value: 'okinawa' },
]

const logout = (router: unknown) => {}
const saveProfile = async () => {}
</script>

<style scoped></style>
