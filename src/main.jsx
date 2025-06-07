import React from 'react';
import { createRoot } from 'react-dom/client';
import BudgetApp from './App';
import './index.css';
import { register, preventWebSocketConnection } from './serviceWorkerRegistration';

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === "production") {
  register(); // 開発時は登録しない
}


// WebSocketの問題を防止
preventWebSocketConnection();

// 無限ループを防ぐためにReactの再レンダリング上限を設定
// React DevToolsの設定をカスタマイズ
// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'development') {
  // デバッグ用の開発環境設定
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    inject: () => { },
    onCommitFiberRoot: () => { },
    onCommitFiberUnmount: () => { },
  };
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  // React.StrictModeを一時的に削除（開発時の二重レンダリングを防止）
  <BudgetApp />
);