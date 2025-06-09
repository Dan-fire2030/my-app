import { auth } from '../../utils/firebase';

// 認証デバッグ用のユーティリティ関数
export const debugAuthState = () => {
  const user = auth.currentUser;
  
  if (!user) {
    console.log('🔴 Debug Auth: No user logged in');
    return null;
  }
  
  const debugInfo = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    isAnonymous: user.isAnonymous,
    metadata: {
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
    },
    providers: user.providerData.map(provider => ({
      providerId: provider.providerId,
      uid: provider.uid,
      email: provider.email,
    })),
    refreshToken: user.refreshToken ? 'Present' : 'Missing',
    timestamp: new Date().toISOString(),
  };
  
  console.log('🟢 Debug Auth: Current user state', debugInfo);
  return debugInfo;
};

// 認証トークンの確認
export const debugAuthToken = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    console.log('🔴 Debug Token: No user logged in');
    return null;
  }
  
  try {
    const idToken = await user.getIdToken(true);
    const tokenResult = await user.getIdTokenResult();
    
    console.log('🟢 Debug Token:', {
      hasToken: !!idToken,
      tokenLength: idToken.length,
      claims: tokenResult.claims,
      expirationTime: tokenResult.expirationTime,
      issuedAtTime: tokenResult.issuedAtTime,
      authTime: tokenResult.authTime,
    });
    
    return tokenResult;
  } catch (error) {
    console.error('🔴 Debug Token: Error getting token', error);
    return null;
  }
};

// ローカルストレージの確認
export const debugLocalStorage = () => {
  const storageKeys = Object.keys(localStorage).filter(key => 
    key.includes('firebase') || key.includes('auth')
  );
  
  const storageData: Record<string, any> = {};
  storageKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      storageData[key] = value ? JSON.parse(value) : null;
    } catch {
      storageData[key] = localStorage.getItem(key);
    }
  });
  
  console.log('🟢 Debug Storage:', {
    keys: storageKeys,
    data: storageData,
    timestamp: new Date().toISOString(),
  });
  
  return storageData;
};

// すべてのデバッグ情報を出力
export const debugAllAuth = async () => {
  console.log('========== AUTH DEBUG START ==========');
  debugAuthState();
  await debugAuthToken();
  debugLocalStorage();
  console.log('========== AUTH DEBUG END ==========');
};