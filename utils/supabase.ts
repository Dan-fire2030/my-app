/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";
import type { Database } from '../types/database';

// 環境変数の取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数の存在チェック
if (!supabaseUrl || supabaseUrl === 'undefined') {
  throw new Error('VITE_SUPABASE_URL is not set');
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
  throw new Error('VITE_SUPABASE_ANON_KEY is not set');
}

// URLの検証
const cleanUrl = supabaseUrl.toString().trim();
const cleanKey = supabaseAnonKey.toString().trim();

console.log('Initializing Supabase client...');
console.log('URL valid:', cleanUrl.startsWith('https://'));

// 最もシンプルな設定でクライアントを作成
export const supabase = createClient<Database>(cleanUrl, cleanKey);
