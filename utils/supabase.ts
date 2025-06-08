/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";
import type { Database } from '../types/database';

// 環境変数の取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// デバッグ用ログ
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);
console.log('Current origin:', window.location.origin);

// 環境変数の存在チェック
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is missing. Please set it in Vercel Environment Variables.');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is missing. Please set it in Vercel Environment Variables.');
}


// URLとキーの検証
console.log('Supabase URL format check:', supabaseUrl);
console.log('URL is valid:', supabaseUrl.startsWith('https://'));
console.log('Anon key length:', supabaseAnonKey.length);

// Supabaseクライアントの作成（本番環境用の修正）
const supabase = createClient<Database>(
  supabaseUrl.trim(), // 空白を削除
  supabaseAnonKey.trim(), // 空白を削除
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    // fetchオプションを明示的に設定
    global: {
      fetch: (...args) => {
        console.log('Fetch called with:', args[0]);
        return fetch(...args);
      },
    }
  }
);

console.log('Supabase client created successfully');

export { supabase };
