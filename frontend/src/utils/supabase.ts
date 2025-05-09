import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-default-supabase-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'your-default-supabase-key';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL または Key が設定されていません。環境変数を確認してください。');
}

console.log('Supabase URL:', supabaseUrl); // デバッグ用

export const supabase = createClient(supabaseUrl, supabaseKey);
