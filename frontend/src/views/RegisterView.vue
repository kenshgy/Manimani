<template>
  <v-container>
    <v-row class="mt-10">
      <v-col cols="1" md="3"></v-col>
      <v-col cols="10" md="6">
        <v-card title="新規会員登録" rounded="lg">
          <v-card-text>
            <v-row>
              <v-col cols="12" class="text-center py-0">
                <v-btn @click="googleRegister" rounded="circle" variant="plain">
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
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="email"
                placeholder="メールアドレスを入力"
                :prepend-inner-icon="mdiEmailOutline"
                variant="underlined"
                :rules="[rules.email]"
              />
              <v-text-field
                v-model="emailConfirm"
                placeholder="メールアドレス(確認用)を入力"
                :prepend-inner-icon="mdiEmailOutline"
                variant="underlined"
                :rules="[rules.emailMatch]"
              />
              <v-text-field
                v-model="password"
                :prepend-inner-icon="mdiLockOutline"
                :append-inner-icon="!visiblePW ? mdiEyeOff : mdiEye"
                @click:append-inner="visiblePW = !visiblePW"
                :type="visiblePW ? 'text' : 'password'"
                :rules="[rules.required, rules.min]"
                hint="At least 8 characters"
                placeholder="パスワードを入力"
                variant="underlined"
              />
              <v-text-field
                v-model="passwordConfirm"
                :prepend-inner-icon="mdiLockOutline"
                :append-inner-icon="!visiblePWC ? mdiEyeOff : mdiEye"
                @click:append-inner="visiblePWC = !visiblePWC"
                :type="visiblePWC ? 'text' : 'password'"
                :rules="[rules.required, rules.min, rules.passwordMatch]"
                hint="At least 8 characters"
                placeholder="パスワード(確認用)を入力"
                variant="underlined"
              />
            </v-form>
            <!-- 利用規約とプライバシーポリシーの同意 -->
            <v-checkbox
              v-model="agreedToTerms"
              :rules="[(v) => v || '利用規約とプライバシーポリシーへの同意が必要です']"
              class="mt-0 mb-4"
              hide-details="auto"
            >
              <template v-slot:label>
                <div>
                  <span>
                    <v-btn x-small @click.stop="showTermsDialog = !showTermsDialog" variant="plain">
                      利用規約
                    </v-btn>
                    と
                    <v-btn
                      x-small
                      @click.stop="showPrivacyDialog = !showPrivacyDialog"
                      variant="plain"
                    >
                      プライバシーポリシー
                    </v-btn>
                    に同意する
                  </span>
                </div>
              </template>
            </v-checkbox>
            <div class="text-center">
              <v-btn
                text="新規会員登録"
                color="primary"
                block
                @click="register"
                :disabled="!valid || !agreedToTerms"
              />
            </div>
            <v-alert v-if="message" type="error" density="compact" class="mt-4">
              {{ message }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <TermsOfService
      :showTermsDialog="showTermsDialog"
      @update:showTermsDialog="showTermsDialog = $event"
    />
    <PrivacyPolycy
      :showPrivacyDialog="showPrivacyDialog"
      @update:showPrivacyDialog="showPrivacyDialog = $event"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mdiEye } from '@mdi/js'
import { mdiEyeOff } from '@mdi/js'
import { mdiLockOutline } from '@mdi/js'
import { mdiEmailOutline } from '@mdi/js'
import { useRouter } from 'vue-router'
import GoogleIcon from '@/components/GoogleIcon.vue'
import PrivacyPolycy from '@/components/dialogs/PrivacyPolycy.vue'
import TermsOfService from '@/components/dialogs/TermsOfService.vue'

const router = useRouter()
const visiblePW = ref(false)
const visiblePWC = ref(false)
const password = ref('')
const passwordConfirm = ref('')
const agreedToTerms = ref(false)
const message = ref('')
const email = ref('')
const emailConfirm = ref('')
const showTermsDialog = ref(false)
const showPrivacyDialog = ref(false)
const valid = ref(true)

interface RegisterForm {
  validate: () => boolean
}

const form = ref<RegisterForm | null>(null)

const rules = {
  required: (value: string) => !!value || 'Required.',
  min: (v: string) => v.length >= 8 || 'Min 8 characters',
  email: (value: string) => /.+@.+\..+/.test(value) || '正しいメールアドレスを入力してください',
  emailMatch: (value: string) => value === email.value || 'メールアドレスが一致しません',
  passwordMatch: (value: string) => value === password.value || 'パスワードが一致しません',
}

const register = async () => {}

const googleRegister = async () => {}
</script>
