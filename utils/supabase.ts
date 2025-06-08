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
        console.log('Supabase fetch:', { url, options });
        
        // URL検証
        if (!url || (typeof url !== 'string' && !(url instanceof URL))) {
          console.error('Invalid URL:', url);
          throw new Error('Invalid URL provided to fetch');
        }
        
        // URLを文字列に変換
        const urlString = url instanceof URL ? url.toString() : String(url);
        
        // ヘッダーを正しい形式に変換
        const headers = new Headers();
        if (options.headers) {
          // HeadersInitの各種形式に対応
          if (options.headers instanceof Headers) {
            options.headers.forEach((value, key) => {
              headers.append(key, value);
            });
          } else if (Array.isArray(options.headers)) {
            options.headers.forEach(([key, value]) => {
              headers.append(key, value);
            });
          } else if (typeof options.headers === 'object') {
            Object.entries(options.headers).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                headers.append(key, String(value));
              }
            });
          }
        }
        
        // オプションの再構築
        const validOptions = {
          ...options,
          headers: headers
        };
        
        console.log('Calling native fetch with valid options');
        return await window.fetch(urlString, validOptions);
      } catch (error) {
        console.error('Fetch error details:', {
          error,
          url,
          options,
          errorMessage: error.message,
          errorStack: error.stack
        });
        throw error;
      }
    }
  }
});
