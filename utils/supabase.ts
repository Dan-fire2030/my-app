/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";
import type { Database } from '../types/database';

// 環境変数の取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// 環境変数の検証
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Supabase client initializing:', {
  url: supabaseUrl,
  keyExists: !!supabaseAnonKey
});

// デフォルトのSupabaseクライアント（カスタムfetchなし）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

console.log('Supabase client created successfully');