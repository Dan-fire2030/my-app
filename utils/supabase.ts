/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";
import type { Database } from '../types/database';

// 環境変数の取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// 環境変数の存在チェック
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is missing. Please set it in Vercel Environment Variables.');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is missing. Please set it in Vercel Environment Variables.');
}

// デバッグ用ログ
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

// Supabaseクライアントの作成（認証エラー修正版）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'implicit'
  },
  // カスタムfetch実装でエラーをキャッチ
  global: {
    fetch: async (url, options = {}) => {
      try {
        console.log('Supabase fetch:', url);
        // URLが文字列でない場合の対処
        const urlString = typeof url === 'string' ? url : String(url);
        return await fetch(urlString, options);
      } catch (error) {
        console.error('Fetch error:', error, 'URL:', url);
        throw error;
      }
    }
  }
});
