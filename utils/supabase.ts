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

// Supabaseクライアントの作成を試みる（最小限の設定）
let supabase;
try {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client created successfully with minimal config');
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  throw error;
}

export { supabase };
