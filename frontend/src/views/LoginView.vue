<template>
  <v-container>
    <v-row class="mt-10">
      <v-col cols="1" md="4"> </v-col>
      <v-col cols="10" md="4">
        <v-card title="ログイン" class="mt-4" rounded="lg">
          <v-card-text>
            <v-row>
              <v-col cols="12" class="text-center py-0">
                <v-btn @click="googleLogin" rounded="circle" variant="plain">
                  <GoogleIcon />
                </v-btn>
              </v-col>
            </v-row>
            <v-row class="align-center justify-center">
              <v-col cols="4" class="d-flex justify-center">
                <v-divider> </v-divider>
              </v-col>
              <v-col cols="4" class="text-center"> または </v-col>
              <v-col cols="4" class="d-flex justify-center">
                <v-divider></v-divider>
              </v-col>
            </v-row>
            <v-form class="mt-2">
              <v-text-field
                label="メールアドレス"
                v-model="email"
                required
                variant="underlined"
                :prepend-inner-icon="mdiEmailOutline"
                autocomplete="email"
              />
              <v-text-field
                label="パスワード"
                :type="visible ? 'text' : 'password'"
                v-model="password"
                required
                variant="underlined"
                :prepend-inner-icon="mdiLockOutline"
                :append-inner-icon="!visible ? mdiEyeOff : mdiEye"
                @click:append-inner="visible = !visible"
                @keyup.enter="login"
                autocomplete="current-password"
              />
              <v-row>
                <v-col cols="12" class="text-center">
                  <v-btn @click="login" color="primary" block>ログイン</v-btn>
                </v-col>
                <v-col cols="12">
                  パスワードをお忘れの方は<a href="/reset-password"> こちら </a>
                </v-col>
                <v-col cols="12" class="pt-0"> 新規会員登録は<a href="/register">こちら</a> </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { mdiEye } from '@mdi/js'
import { mdiEyeOff } from '@mdi/js'
import { mdiLockOutline } from '@mdi/js'
import { mdiEmailOutline } from '@mdi/js'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useRouter } from 'vue-router'
import { signInWithGoogle } from '../firebase'
import GoogleIcon from '../components/GoogleIcon.vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const visible = ref(false)

const googleLogin = async () => {
  try {
    await signInWithGoogle()
    router.push('/account')
  } catch (error) {
    console.error(error)
  }
}

const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/account')
  } catch (error) {
    console.log(error)
  }
}
</script>

<style scoped></style>
