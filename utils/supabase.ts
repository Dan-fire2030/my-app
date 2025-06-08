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

console.log('Supabase environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValid: supabaseUrl.startsWith('https://')
});

// 完全に安全なfetch実装
const safeFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  try {
    // RequestInfo | URLを文字列に変換
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      throw new Error('Invalid URL type');
    }

    console.log('Safe fetch called:', url);

    // 安全なオプションの作成
    const safeInit: RequestInit = {
      method: init?.method || 'GET',
      headers: {},
      body: init?.body,
      mode: init?.mode || 'cors',
      credentials: init?.credentials || 'same-origin',
    };

    // ヘッダーの安全な処理
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          (safeInit.headers as Record<string, string>)[key] = value;
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          (safeInit.headers as Record<string, string>)[key] = value;
        });
      } else if (typeof init.headers === 'object') {
        Object.entries(init.headers).forEach(([key, value]) => {
          if (value) {
            (safeInit.headers as Record<string, string>)[key] = String(value);
          }
        });
      }
    }

    console.log('Safe fetch options:', { url, method: safeInit.method });

    // ネイティブfetchの呼び出し
    const response = await window.fetch(url, safeInit);
    console.log('Safe fetch response:', response.status, response.ok);
    return response;
  } catch (error) {
    console.error('Safe fetch error:', error);
    throw error;
  }
};

// グローバルfetchを置換
if (typeof window !== 'undefined') {
  console.log('Replacing global fetch with safe implementation');
  (window as any).fetch = safeFetch;
  (globalThis as any).fetch = safeFetch;
}

// Supabaseクライアントの作成
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: safeFetch,
  },
});

console.log('Supabase client initialized with safe fetch');