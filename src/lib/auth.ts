import { supabase } from './supabase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  needsProfile?: boolean;
}

export async function loginWithEmailAndPassword({ email, password }: LoginCredentials): Promise<LoginResult> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Email not confirmed') {
        return {
          success: false,
          error: 'メールアドレスの確認が完了していません。メールをご確認ください。'
        };
      }
      return {
        success: false,
        error: error.message
      };
    }

    // プロフィールの存在を確認
    if (authData.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        return {
          success: true,
          needsProfile: true
        };
      }
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'ログインに失敗しました'
    };
  }
} 