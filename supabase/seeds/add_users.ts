// seed-users.ts
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// NODE_ENV によってファイルを選ぶ
const envPath = {
  development: '.env.local',
  staging: '.env.staging',
  production: '.env.production',
  test: '.env.test'
}[process.env.NODE_ENV || 'development']

dotenv.config({ path: envPath })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const users = [
  { email: 'user1@example.com', password: 'password123' },
  { email: 'user2@example.com', password: 'password123' },
  { email: 'user3@example.com', password: 'password123' },
]

async function seedUsers() {
  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // メール確認不要にする（開発用）
    })

    if (error) {
      console.error(`❌ ${user.email} の登録に失敗:`, error.message)
    } else {
      console.log(`✅ ${user.email} の登録に成功`)
    }
  }
}

seedUsers()