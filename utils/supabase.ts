/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";
import type { Database } from '../types/database';

// fetch polyfillを最初に導入
import 'whatwg-fetch';
import fetch from 'cross-fetch';

// 環境変数の取得と厳密な検証
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'undefined' || !supabaseUrl.startsWith('https://')) {
  throw new Error(`Invalid VITE_SUPABASE_URL: ${supabaseUrl}`);
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined' || supabaseAnonKey.length < 50) {
  throw new Error(`Invalid VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'length=' + supabaseAnonKey.length : 'undefined'}`);
}

console.log('Supabase initialization:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length,
  isProduction: window.location.hostname.includes('vercel.app')
});

// グローバルfetchを置換
globalThis.fetch = fetch;

// Supabaseクライアントを最小限の設定で作成
export const supabase = createClient<Database>(
  supabaseUrl.trim(),
  supabaseAnonKey.trim(),
  {
    // 最小限の設定のみ
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    // カスタムfetchを使用
    global: {
      fetch: fetch,
    }
  }
);

console.log('Supabase client created successfully with cross-fetch');