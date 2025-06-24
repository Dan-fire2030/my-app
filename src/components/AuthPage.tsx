import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/FirebaseAuthContext';

const AuthContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ff 0%, #f0f9ff 50%, #f0fff4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const AuthCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 48px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  
  @media (max-width: 640px) {
    padding: 32px 24px;
  }
`;

const AuthHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const AuthTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 50%, #F59E0B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
`;

const AuthSubtitle = styled.p`
  color: #7C3AED;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.8;
`;

const AuthForm = styled.form`
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
`;

const InputGroup = styled.div`
  display: grid;
  gap: 8px;
`;

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  background: white;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
  
  &:hover {
    border-color: #d1d5db;
    background-color: #f9fafb;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: #2563eb;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
`;

const AuthToggle = styled.div`
  text-align: center;
  margin-top: 24px;
  color: #6b7280;
  font-size: 14px;
`;

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, signIn, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isSignUp && password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    
    setLoading(true);
    
    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password);
      } else {
        result = await signIn(email, password);
      }
      
      if (result.error) {
        // Handle specific Firebase auth errors
        const errorCode = result.error.code;
        switch (errorCode) {
          case 'auth/operation-not-allowed':
            setError('この認証方法は有効化されていません。管理者にお問い合わせください。');
            break;
          case 'auth/user-not-found':
            setError('このメールアドレスは登録されていません。新規登録をお試しください。');
            break;
          case 'auth/wrong-password':
            setError('パスワードが正しくありません。もう一度お試しください。');
            break;
          case 'auth/invalid-credential':
            setError('メールアドレスまたはパスワードが正しくありません。');
            break;
          case 'auth/too-many-requests':
            setError('ログイン試行回数が多すぎます。しばらく時間をおいてからお試しください。');
            break;
          case 'auth/email-already-in-use':
            setError('このメールアドレスは既に登録されています。ログインをお試しください。');
            break;
          case 'auth/weak-password':
            setError('セキュリティのため、パスワードは6文字以上で設定してください。');
            break;
          case 'auth/invalid-email':
            setError('正しいメールアドレスの形式で入力してください。');
            break;
          case 'auth/network-request-failed':
            setError('ネットワークエラーが発生しました。インターネット接続を確認してください。');
            break;
          default:
            setError('エラーが発生しました。しばらく時間をおいてからお試しください。');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('エラーが発生しました。しばらく時間をおいてからお試しください。');
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    console.log('Google sign in button clicked');
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google sign in error:', error);
        const errorCode = (error as any).code;
        switch (errorCode) {
          case 'auth/operation-not-allowed':
            setError('Google認証が有効化されていません。Firebase Consoleで有効化してください。');
            break;
          case 'auth/popup-blocked':
            setError('ポップアップがブロックされました。ポップアップを許可してください。');
            break;
          case 'auth/popup-closed-by-user':
            setError('認証がキャンセルされました。');
            break;
          case 'auth/unauthorized-domain':
            setError('このドメインは認証に許可されていません。');
            break;
          default:
            setError('Googleログインに失敗しました。もう一度お試しください。');
        }
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Googleログインに失敗しました。もう一度お試しください。');
    }
    
    setLoading(false);
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader>
          <AuthTitle>家計簿アプリ</AuthTitle>
          <AuthSubtitle>
            {isSignUp ? 'アカウントを作成して始めましょう' : 'おかえりなさい'}
          </AuthSubtitle>
        </AuthHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <GoogleButton onClick={handleGoogleSignIn} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Googleでログイン
        </GoogleButton>

        <AuthForm onSubmit={handleSubmit}>
          <InputGroup>
            <InputLabel>メールアドレス</InputLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </InputGroup>

          <InputGroup>
            <InputLabel>パスワード</InputLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </InputGroup>

          {isSignUp && (
            <InputGroup>
              <InputLabel>パスワード確認</InputLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </InputGroup>
          )}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? '処理中...' : isSignUp ? 'アカウント作成' : 'ログイン'}
          </SubmitButton>
        </AuthForm>

        <AuthToggle>
          {isSignUp ? (
            <>
              既にアカウントをお持ちですか？{' '}
              <ToggleButton 
                type="button" 
                onClick={() => setIsSignUp(false)}
              >
                ログインする
              </ToggleButton>
            </>
          ) : (
            <>
              アカウントをお持ちでない方は{' '}
              <ToggleButton 
                type="button" 
                onClick={() => setIsSignUp(true)}
              >
                アカウント作成
              </ToggleButton>
            </>
          )}
        </AuthToggle>
      </AuthCard>
    </AuthContainer>
  );
};

export default AuthPage;