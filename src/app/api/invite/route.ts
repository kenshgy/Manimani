import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    console.log('招待APIが呼び出されました')
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabaseの環境変数が設定されていません')
      return NextResponse.json(
        { error: 'サーバー設定エラー: Supabaseの環境変数が設定されていません' },
        { status: 500 }
      )
    }

    // サービスロールキーを使用してSupabaseクライアントを作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const body = await request.json()
    console.log('リクエストボディ:', body)

    const { email, invited_by } = body

    // メールアドレスのバリデーション
    if (!email || !email.includes('@')) {
      console.log('無効なメールアドレス:', email)
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      )
    }
    // 招待メール送信を試行
    console.log('招待メール送信を試行:', email)
    console.log(`${process.env.NEXT_PUBLIC_APP_URL}/signup`)
    // 招待メールの送信
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/signup`
    })

    if (inviteError) {
      console.error('Supabase招待エラー:', inviteError)
      return NextResponse.json(
        { error: '招待メールの送信に失敗しました', details: inviteError.message },
        { status: 500 }
      )
    }

    // 招待履歴を保存
    const { error: insertError } = await supabase
      .from('invites')
      .insert([
        {
          email,
          status: 'pending',
          invited_by: invited_by,
        }
      ])

    if (insertError) {
      console.error('招待履歴の保存に失敗:', insertError)
      // 招待メールは送信済みなので、エラーを返さない
    }

    console.log('招待メール送信成功:', email)
    return NextResponse.json(
      { message: '招待メールを送信しました' },
      { status: 200 }
    )
  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error instanceof Error ? error.message : '不明なエラー' },
      { status: 500 }
    )
  }
} 