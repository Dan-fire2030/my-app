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

// 原始的なfetch関数を保存
const originalFetch = window.fetch;

// Supabaseのfetchエラーを回避する最終的な解決策
const fixedFetch = (input: any, init?: any) => {
  // 入力を厳密に検証
  let url: string;
  
  if (typeof input === 'string') {
    url = input;
  } else if (input && typeof input.toString === 'function') {
    url = input.toString();
  } else {
    throw new Error('Invalid fetch input');
  }

  // initオプションを安全に処理
  const safeInit: any = {};
  
  if (init) {
    if (init.method) safeInit.method = String(init.method);
    if (init.body !== undefined) safeInit.body = init.body;
    if (init.mode) safeInit.mode = String(init.mode);
    if (init.credentials) safeInit.credentials = String(init.credentials);
    
    // ヘッダーを安全に変換
    if (init.headers) {
      safeInit.headers = {};
      if (typeof init.headers === 'object') {
        for (const [key, value] of Object.entries(init.headers)) {
          if (value != null) {
            safeInit.headers[String(key)] = String(value);
          }
        }
      }
    }
  }

  return originalFetch.call(window, url, safeInit);
};

// Supabaseクライアントの作成（修正版fetch使用）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
  },
  global: {
    fetch: fixedFetch,
  },
});

console.log('Supabase client created with fixed fetch');