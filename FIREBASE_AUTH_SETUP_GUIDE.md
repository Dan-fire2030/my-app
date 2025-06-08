# Firebase Google認証 完全実装ガイド

## 📋 概要
ReactアプリケーションでFirebase Authentication（Google認証）を実装するための完全ガイドです。
このガイドに従えば、確実にGoogle認証が動作するアプリケーションを作成できます。

---

## 🚀 1. 事前準備

### 1.1 必要なアカウント
- [ ] Googleアカウント
- [ ] Vercel アカウント（デプロイ用）

### 1.2 プロジェクト構成
```
project-root/
├── src/
│   ├── contexts/
│   ├── components/
│   └── utils/
├── .env.local
└── package.json
```

---

## 🔧 2. Firebase プロジェクト設定

### 2.1 Firebase Console での設定
1. **Firebase Console にアクセス**
   ```
   https://console.firebase.google.com/
   ```

2. **新しいプロジェクトを作成**
   - プロジェクト名を入力（例：`my-app-auth`）
   - Google Analytics を有効化（推奨）
   - 「プロジェクトを作成」をクリック

3. **Authentication 設定**
   - 左メニュー「Authentication」を選択
   - 「始める」をクリック
   - 「Sign-in method」タブを選択
   - 「Google」を選択して有効化
   - プロジェクトサポートメール（あなたのGmail）を設定
   - 「保存」をクリック

4. **ウェブアプリを追加**
   - プロジェクト概要で「ウェブアプリを追加」（`</>`アイコン）をクリック
   - アプリのニックネーム（例：`my-app-web`）を入力
   - Firebase Hosting設定はスキップ
   - 「アプリを登録」をクリック

5. **設定情報をコピー**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

### 2.2 承認済みドメインの追加
1. **Authentication → Settings → 承認済みドメイン**
2. **「ドメインを追加」をクリック**
   - 本番環境：`your-app.vercel.app`
   - 開発環境：`localhost`（デフォルトで追加済み）

---

## 📦 3. パッケージインストール

### 3.1 必要なパッケージ
```bash
npm install firebase
```

### 3.2 TypeScriptを使用する場合
```bash
npm install firebase @types/node
```

---

## ⚙️ 4. 環境変数設定

### 4.1 .env.local ファイル作成
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4.2 環境変数の値を設定
Firebase Console で取得した設定情報を、それぞれの環境変数に設定してください。

---

## 🛠 5. ファイル実装

### 5.1 Firebase設定ファイル
**ファイル**: `utils/firebase.ts` または `utils/firebase.js`

```typescript
/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Auth インスタンス
export const auth = getAuth(app);

// Firestore インスタンス（将来的なデータベース用）
export const db = getFirestore(app);

// Analytics インスタンス（ブラウザ環境でのみ）
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

console.log('Firebase initialized successfully:', {
  projectId: firebaseConfig.projectId,
  hasAuth: !!auth,
  hasFirestore: !!db,
  hasAnalytics: !!analytics
});
```

### 5.2 認証コンテキスト
**ファイル**: `src/contexts/AuthContext.tsx` または `src/contexts/AuthContext.jsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../../utils/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: Error }>;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signInWithGoogle: () => Promise<{ error?: Error }>;
  signOut: () => Promise<{ error?: Error }>;
  resetPassword: (email: string) => Promise<{ error?: Error }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Firebase Auth: Initializing...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase Auth: State changed:', { 
        hasUser: !!user, 
        email: user?.email,
        uid: user?.uid 
      });
      
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Firebase Auth: Sign up attempt for:', email);
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: undefined };
    } catch (err: any) {
      console.error('Firebase Auth: Sign up error:', err);
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Firebase Auth: Sign in attempt for:', email);
      await signInWithEmailAndPassword(auth, email, password);
      return { error: undefined };
    } catch (err: any) {
      console.error('Firebase Auth: Sign in error:', err);
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Firebase Auth: Google sign in attempt');
      await signInWithPopup(auth, googleProvider);
      console.log('Firebase Auth: Google sign in successful');
      return { error: undefined };
    } catch (err: any) {
      console.error('Firebase Auth: Google sign in error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('Firebase Auth: Sign out attempt');
      await firebaseSignOut(auth);
      return { error: undefined };
    } catch (err: any) {
      console.error('Firebase Auth: Sign out error:', err);
      return { error: err };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Firebase Auth: Password reset attempt for:', email);
      await sendPasswordResetEmail(auth, email);
      return { error: undefined };
    } catch (err: any) {
      console.error('Firebase Auth: Password reset error:', err);
      return { error: err };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### 5.3 メインアプリケーション設定
**ファイル**: `src/main.tsx` または `src/main.jsx`

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### 5.4 認証ページコンポーネント
**ファイル**: `src/components/AuthPage.tsx` または `src/components/AuthPage.jsx`

```typescript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp, signIn, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (result.error) {
        setError(result.error.message);
      }
    } catch (err: any) {
      setError('予期しないエラーが発生しました');
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError('Googleログインに失敗しました');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>{isSignUp ? 'サインアップ' : 'ログイン'}</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Google認証ボタン */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Googleでログイン
      </button>

      {/* メール/パスワード認証フォーム */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label>メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isSignUp ? 'サインアップ' : 'ログイン'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '16px' }}>
        {isSignUp ? 'アカウントをお持ちですか？' : 'アカウントをお持ちでないですか？'}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
        >
          {isSignUp ? 'ログイン' : 'サインアップ'}
        </button>
      </p>
    </div>
  );
};

export default AuthPage;
```

### 5.5 メインアプリコンポーネント
**ファイル**: `src/App.tsx` または `src/App.jsx`

```typescript
import React from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';

const App: React.FC = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>アプリケーション</h1>
        <div>
          <span style={{ marginRight: '16px' }}>
            こんにちは、{user.displayName || user.email}さん
          </span>
          <button
            onClick={signOut}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ログアウト
          </button>
        </div>
      </header>

      <main>
        <h2>メインコンテンツ</h2>
        <p>ユーザーID: {user.uid}</p>
        <p>メールアドレス: {user.email}</p>
        {user.photoURL && (
          <img 
            src={user.photoURL} 
            alt="プロフィール" 
            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
          />
        )}
      </main>
    </div>
  );
};

export default App;
```

---

## 🚀 6. デプロイ設定

### 6.1 Vercel 環境変数設定
1. **Vercel ダッシュボード → プロジェクト → Settings → Environment Variables**
2. **以下の環境変数を追加**:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
3. **すべてに Production, Preview, Development をチェック**
4. **「Save」後、「Redeploy」を実行**

### 6.2 Firebase 承認済みドメイン追加
1. **Firebase Console → Authentication → Settings → 承認済みドメイン**
2. **Vercel ドメインを追加**:
   ```
   your-app-name.vercel.app
   ```

---

## ✅ 7. 動作確認

### 7.1 チェックリスト
- [ ] アプリケーションが正常に読み込まれる
- [ ] 「Googleでログイン」ボタンが表示される
- [ ] Google認証ポップアップが開く
- [ ] 認証後、ユーザー情報が表示される
- [ ] ログアウトが正常に動作する
- [ ] ページリロード後もログイン状態が保持される

### 7.2 トラブルシューティング

#### エラー: `auth/invalid-api-key`
- **原因**: 環境変数が正しく設定されていない
- **解決**: Vercel の環境変数設定を確認し、再デプロイ

#### エラー: `auth/unauthorized-domain`
- **原因**: Firebase の承認済みドメインに本番ドメインが追加されていない
- **解決**: Firebase Console で承認済みドメインを追加

#### Google認証ポップアップが開かない
- **原因**: ポップアップブロッカーまたはセキュリティ設定
- **解決**: ブラウザの設定を確認、プライベートモードで試行

---

## 📝 8. 開発時の注意点

### 8.1 セキュリティ
- [ ] 環境変数をGitにコミットしない（`.gitignore`に`.env.local`を追加）
- [ ] APIキーを直接コードに記述しない
- [ ] 本番環境では適切なFirestore セキュリティルールを設定

### 8.2 ベストプラクティス
- [ ] エラーハンドリングを適切に実装
- [ ] ローディング状態の表示
- [ ] ユーザーフレンドリーなエラーメッセージ
- [ ] 適切なログ出力（デバッグ用）

### 8.3 パフォーマンス
- [ ] Firebase SDKの必要な機能のみインポート
- [ ] 認証状態の変更を適切に監視
- [ ] メモリリークを防ぐためのクリーンアップ

---

## 🎯 9. 追加機能の実装

### 9.1 パスワードリセット機能
```typescript
const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    alert('パスワードリセットメールを送信しました');
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
  }
};
```

### 9.2 プロフィール更新機能
```typescript
import { updateProfile } from 'firebase/auth';

const updateUserProfile = async (displayName: string, photoURL?: string) => {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName,
      photoURL
    });
  }
};
```

### 9.3 メール認証機能
```typescript
import { sendEmailVerification } from 'firebase/auth';

const sendVerificationEmail = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
    alert('認証メールを送信しました');
  }
};
```

---

## 🔄 10. 他のプロジェクトへの適用

### 10.1 このガイドの使い方
1. **新しいFirebase プロジェクトを作成**
2. **このガイドの手順1-3を実行**
3. **ファイル5.1-5.5をコピーして、必要に応じてカスタマイズ**
4. **環境変数を新しいプロジェクト用に設定**
5. **デプロイして動作確認**

### 10.2 カスタマイズポイント
- UI/UXデザインの変更
- 追加の認証プロバイダー（Facebook, Twitter等）
- 追加のユーザー情報管理
- 権限・ロール管理システム

---

## 📚 参考資料

- [Firebase Authentication ドキュメント](https://firebase.google.com/docs/auth)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)
- [Firebase セキュリティルール](https://firebase.google.com/docs/rules)
- [Vercel 環境変数設定](https://vercel.com/docs/concepts/projects/environment-variables)

---

*最終更新: 2025年6月8日*
*作成者: Claude Code Assistant*

**🎉 このガイドで確実にFirebase Google認証が実装できます！**