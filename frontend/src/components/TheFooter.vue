<template>
  <!-- フッター -->
  <v-footer padless class="mt-12">
    <v-container>
      <v-row>
        <v-col v-for="(menu, index) in footerMenus" :key="index" cols="12" sm="6" md="3">
          <h3 class="text-h6 font-weight-bold mb-4">{{ menu.title }}</h3>
          <v-list dense nav>
            <v-list-item v-for="(item, i) in menu.items" :key="i" :to="item.link" link>
              <v-list-item-content>
                <v-list-item-title class="grey--text">
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
      <v-divider class="my-6"></v-divider>
      <div class="text-center grey--text text--darken-1">
        &copy; {{ new Date().getFullYear() }} NotoClub All rights reserved.
      </div>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
const footerMenus = [
  {
    title: 'About',
    items: [
      { text: 'NotoClubについて', link: '/about' },
      { text: '利用規約', link: '/terms' },
      { text: 'プライバシーポリシー', link: '/privacy' },
    ],
  },
  {
    title: 'Contents',
    items: [
      { text: 'ニュース', link: '/news' },
      { text: 'スケジュール', link: '/schedule' },
      { text: 'フォト', link: '/photos' },
    ],
  },
  {
    title: 'Member',
    items: [
      { text: 'ログイン', link: '/login' },
      { text: '新規会員登録', link: '/register' },
    ],
  },
  {
    title: 'Contact',
    items: [
      { text: 'お問い合わせ', link: '/contact' },
      { text: 'よくある質問', link: '/faq' },
    ],
  },
]
</script>
