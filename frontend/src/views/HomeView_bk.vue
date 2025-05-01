<template>
  <v-main>
    <!-- ヒーローセクション -->
    <v-parallax src="https://picsum.photos/1920/1080?random" height="600">
      <v-container fill-height>
        <v-row align="center">
          <v-col cols="12" md="6">
            <h1 class="text-h2 font-weight-bold white--text mb-4">NotoClubへようこそ</h1>
            <p class="text-h5 white--text mb-8">
              最新のニュース、限定コンテンツ、チケット先行予約など、
              ここでしか体験できない特別なコンテンツをお届けします。
            </p>
            <v-btn x-large color="secondary" class="text-h6" @click="$router.push('/register')">
              会員登録はこちら
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-parallax>

    <!-- 最新情報セクション -->
    <v-container class="py-12">
      <h2 class="text-h3 text-center font-weight-bold mb-12">最新情報</h2>
      <v-row>
        <v-col v-for="i in 3" :key="i" cols="12" md="4">
          <v-card elevation="2">
            <v-img src="https://picsum.photos/400/200?random" height="200" cover></v-img>
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon small class="mr-2">{{ mdiCalendar }}</v-icon>
                <span class="text-caption grey--text">2024.02.10</span>
              </div>
              <h3 class="text-h6 font-weight-bold mb-2">ニュースタイトル {{ i }}</h3>
              <p class="text-body-2 grey--text">
                最新のニュースやイベント情報をお届けします。
                NotoClub会員限定の特別なお知らせもこちらでチェック
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 特典セクション -->
    <v-container class="py-12 grey lighten-4">
      <h2 class="text-h3 text-center font-weight-bold mb-12">会員特典</h2>
      <v-row>
        <v-col v-for="(benefit, index) in benefits" :key="index" cols="12" md="4">
          <v-card class="text-center pa-6" flat>
            <v-icon x-large color="primary" class="mb-4">
              {{ benefit.icon }}
            </v-icon>
            <h3 class="text-h5 font-weight-bold mb-4">
              {{ benefit.title }}
            </h3>
            <p class="text-body-1 grey--text">
              {{ benefit.description }}
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { mdiGift, mdiMusic, mdiStar, mdiCalendar } from '@mdi/js'

const benefits = [
  {
    icon: mdiStar,
    title: '先行チケット予約',
    description: 'コンサートやイベントのチケットを一般発売に先駆けて予約できます。',
  },
  {
    icon: mdiMusic,
    title: '限定コンテンツ',
    description:
      'メイキング映像やインタビュー、限定フォトなど、ここでしか見られないコンテンツを配信。',
  },
  {
    icon: mdiGift,
    title: '会員限定グッズ',
    description: 'オリジナルグッズやコラボレーションアイテムを会員限定で販売します。',
  },
]
</script>
