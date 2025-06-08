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

// Supabaseクライアントの作成（最小構成に戻す）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false, // 自動検出を無効化
    persistSession: false, // セッション永続化を無効化
    autoRefreshToken: false, // 自動更新を無効化
  }
});

// 認証後のコールバック処理を手動で実装
if (typeof window !== 'undefined') {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  
  if (accessToken) {
    console.log('Manual token processing:', accessToken.substring(0, 20) + '...');
    
    // トークンを手動でセッションに設定
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: hashParams.get('refresh_token') || '',
    }).then(({ error }) => {
      if (error) {
        console.error('Session setting error:', error);
      } else {
        console.log('Session set successfully');
        // URLのハッシュをクリア
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });
  }
}
