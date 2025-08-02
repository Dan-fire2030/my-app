import React from 'react';
import { createRoot } from 'react-dom/client';
import BudgetApp from './App';
import './index.css';
import { register } from './serviceWorkerRegistration';
import { AuthProvider } from './contexts/FirebaseAuthContext';

// Service Worker登録（PWA有効化）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    register();
  });
}


// WebSocketの問題を防止（コメントアウト）
// preventWebSocketConnection();

// React DevToolsの設定（コメントアウト）

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BudgetApp />
    </AuthProvider>
  </React.StrictMode>
);