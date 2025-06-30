// App.jsx - fetch interceptorを削除

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { StatusBar, Style } from '@capacitor/status-bar';
import {
  getLatestBudget,
  createNewBudget,
  updateBudgetTransactions,
  getBudgetHistory
} from '../utils/firebaseFunctions';
import TransactionInput from './components/TransactionInput';
import BudgetSetting from './components/BudgetSetting';
import BalanceDisplay from './components/BalanceDisplay';
import TransactionHistoryUpdated from './components/TransactionHistoryUpdated';
import MonthlyHistory from './components/MonthlyHistory';
import RemainingAmountMeter from './components/RemainingAmountMeter';
import GenreBreakdown from './components/GenreBreakdown';
import AuthPage from './components/AuthPage';
import { CategoryManager } from './components/CategoryManager';
import { useAuth } from './contexts/FirebaseAuthContext';

// URLパラメータをログ出力（認証コールバックのデバッグ用）
if (typeof window !== 'undefined') {
  const hash = window.location.hash;
  const params = new URLSearchParams(window.location.search);
  if (hash || params.toString()) {
    console.log('Auth callback detected:', {
      hash,
      params: params.toString(),
      fullURL: window.location.href
    });
  }
}

// 最小限のアニメーション定義
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #000000 100%);
  padding: 16px;
  color: #ffffff;
  
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const MainContainer = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  position: relative;
`;

const Header = styled.div`
  position: relative;
  text-align: center;
  margin-bottom: 32px;
  animation: ${fadeIn} 0.6s ease-out;
  padding-top: 60px;
  
  @media (max-width: 768px) {
    padding-top: 0;
  }
`;

const UserInfo = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 1px solid #FFD700;
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
  z-index: 10;
  
  @media (max-width: 768px) {
    position: static;
    margin-bottom: 16px;
    justify-content: center;
  }
`;

const UserEmail = styled.span`
  font-size: 14px;
  color: #e5e5e5;
  font-weight: 500;
  
  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: 1px solid #FFD700;
  color: #000000;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// シンプルなハンバーガーボタン
const HamburgerButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border: 2px solid #FFD700;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 30;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(255, 215, 0, 0.5);
    border-color: #FFA500;
  }
  
  @media (max-width: 640px) {
    width: 48px;
    height: 48px;
  }
`;

// シンプルなハンバーガーアイコン
const HamburgerIcon = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  
  @media (max-width: 640px) {
    width: 20px;
    height: 20px;
  }
  
  .line {
    position: absolute;
    width: 100%;
    height: 2px;
    background: linear-gradient(45deg, #FFD700, #FFA500);
    border-radius: 2px;
    transition: all 0.3s ease;
    
    &:nth-child(1) {
      top: 25%;
      transform: translateY(-50%);
    }
    
    &:nth-child(2) {
      top: 50%;
      transform: translateY(-50%);
      opacity: 1;
    }
    
    &:nth-child(3) {
      top: 75%;
      transform: translateY(-50%);
    }
  }
  
  &.open .line {
    &:nth-child(1) {
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
    }
    
    &:nth-child(2) {
      opacity: 0;
    }
    
    &:nth-child(3) {
      top: 50%;
      transform: translateY(-50%) rotate(-45deg);
    }
  }
`;

// モーダル形式のメニュー
const MenuModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: ${props => props.isOpen ?
    'translate(-50%, -50%) scale(1)' :
    'translate(-50%, -50%) scale(0.95)'};
  width: 90vw;
  max-width: 600px;
  max-height: 80vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
  z-index: 1001;
  padding: 32px;
  padding-right: 20px;
  overflow-y: auto;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  border: 2px solid #FFD700;
  
  /* カスタムスクロールバー */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 4px;
    margin: 8px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #FFD700;
    border-radius: 4px;
    
    &:hover {
      background: #FFA500;
    }
  }
  
  /* Firefox用 */
  scrollbar-width: thin;
  scrollbar-color: #FFD700 #1a1a1a;
  
  @media (max-width: 640px) {
    width: 95vw;
    padding: 24px;
    padding-right: 16px;
    max-height: 85vh;
  }
`;

// モーダルオーバーレイ
const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  cursor: pointer;
`;

// モーダルヘッダー
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #FFD700;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
  border: 1px solid #FFD700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    transform: scale(1.05);
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: #FFD700;
  }
  
  &:hover svg {
    color: #000000;
  }
`;

const MenuContent = styled.div`
  display: grid;
  gap: 24px;
`;

// バーガーメニュー用の月次設定ボタン
const BudgetSettingButton = styled.button`
  width: 100%;
  padding: 20px 24px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1f1f1f 100%);
  color: #FFD700;
  font-weight: 700;
  font-size: 16px;
  border: 2px solid #FFD700;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 16px rgba(255, 215, 0, 0.2),
    inset 0 1px 0 rgba(255, 215, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  /* グロー効果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 50%, #2f2f2f 100%);
    border-color: #FFA500;
    color: #FFA500;
    box-shadow: 
      0 8px 24px rgba(255, 215, 0, 0.4),
      0 0 20px rgba(255, 215, 0, 0.2),
      inset 0 1px 0 rgba(255, 165, 0, 0.2);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 
      0 4px 12px rgba(255, 215, 0, 0.3),
      inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    width: 22px;
    height: 22px;
    filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3));
  }
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 24px;
`;

const AnimatedSection = styled.div`
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 900;
  font-family: 'Orbitron', 'Montserrat', -apple-system, sans-serif;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
  
  /* 浮かび上がる効果 */
  text-shadow: 
    0 1px 0 rgba(255, 215, 0, 0.3),
    0 2px 4px rgba(255, 215, 0, 0.2),
    0 4px 8px rgba(255, 215, 0, 0.15),
    0 8px 16px rgba(255, 215, 0, 0.1),
    0 16px 32px rgba(255, 215, 0, 0.05);
  
  /* アニメーション */
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  
  /* グロー効果 */
  &::before {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: blur(10px);
    opacity: 0.5;
  }
  
  @media (max-width: 640px) {
    font-size: 32px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #cccccc;
  margin-top: 4px;
  margin-bottom: 24px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.8;
  
  @media (max-width: 640px) {
    font-size: 12px;
  }
`;


// 支出入力モーダル
const ExpenseModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: ${props => props.isOpen ?
    'translate(-50%, -50%) scale(1)' :
    'translate(-50%, -50%) scale(0.95)'};
  width: 90vw;
  max-width: 500px;
  max-height: 80vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
  z-index: 1001;
  padding: 32px;
  overflow-y: auto;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  border: 2px solid #FFD700;
  
  @media (max-width: 640px) {
    width: 95vw;
    padding: 24px;
    max-height: 85vh;
  }
`;

// 支出モーダルオーバーレイ
const ExpenseOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  cursor: pointer;
`;

// 支出モーダルヘッダー
const ExpenseModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #FFD700;
`;

const ExpenseModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

// 月次予算設定モーダル
const BudgetSetupModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: ${props => props.isOpen ?
    'translate(-50%, -50%) scale(1)' :
    'translate(-50%, -50%) scale(0.95)'};
  width: 90vw;
  max-width: 480px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
  z-index: 1002;
  padding: 40px;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  border: 2px solid #FFD700;
  
  @media (max-width: 640px) {
    width: 95vw;
    padding: 32px 24px;
  }
`;

const BudgetSetupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1001;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const BudgetSetupHeader = styled.div`
  position: relative;
  text-align: center;
  margin-bottom: 32px;
  padding-right: 60px;
  
  @media (max-width: 640px) {
    padding-right: 50px;
  }
`;

const BudgetSetupTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
`;

const BudgetSetupSubtitle = styled.p`
  color: #cccccc;
  font-size: 16px;
  margin: 0;
`;

const BudgetSetupContent = styled.div`
  display: grid;
  gap: 24px;
`;

const BudgetConfirmSection = styled.div`
  background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
  border: 1px solid #FFD700;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const BudgetConfirmAmount = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #FFD700;
  margin-bottom: 8px;
`;

const BudgetConfirmText = styled.p`
  color: #cccccc;
  font-size: 16px;
  margin: 0;
`;

const BudgetActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const BudgetActionButton = styled.button`
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #000000;
    box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
    }
  ` : `
    background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
    color: #cccccc;
    border: 1px solid #666666;
    
    &:hover {
      background: linear-gradient(135deg, #333333 0%, #2a2a2a 100%);
      border-color: #FFD700;
      color: #FFD700;
    }
  `}
`;

const ModalContainer = styled.div.attrs({
  className: 'container modal'
})`
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
`;

const BudgetApp = () => {
  const { user, loading, signOut } = useAuth();

  // 状態管理（すべてのHooksを最初に配置）
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [selectedRadioButton, setSelectedRadioButton] = useState("食費");
  const [jenre, setJenre] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetConfirmStep, setBudgetConfirmStep] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryRefreshKey, setCategoryRefreshKey] = useState(0);

  // ヘルパー関数
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const isBudgetSetForCurrentMonth = (latestBudget) => {
    if (!latestBudget || !latestBudget.created_at) {
      console.log('📅 No budget or created_at field');
      return false;
    }

    // Firestoreのタイムスタンプを処理
    let budgetDate;
    if (latestBudget.created_at.toDate) {
      budgetDate = latestBudget.created_at.toDate();
    } else if (latestBudget.created_at instanceof Date) {
      budgetDate = latestBudget.created_at;
    } else {
      budgetDate = new Date(latestBudget.created_at);
    }

    const budgetMonth = `${budgetDate.getFullYear()}-${String(budgetDate.getMonth() + 1).padStart(2, '0')}`;
    const currentMonth = getCurrentMonth();

    console.log('📅 Date comparison:', {
      budgetDate: budgetDate.toISOString(),
      budgetMonth,
      currentMonth,
      matches: budgetMonth === currentMonth
    });

    return budgetMonth === currentMonth;
  };

  // カテゴリー読み込み関数
  const loadCategories = async () => {
    if (!user?.uid) return;
    
    try {
      // カテゴリー取得のサービス関数があると仮定
      // 実際の実装では getUserCategories を import する必要があります
      console.log('Loading categories for user:', user.uid);
      setCategoryRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // useEffectも条件分岐の前に配置
  useEffect(() => {
    // URL認証処理を最初にチェック
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('code') || urlParams.get('access_token') || urlParams.get('refresh_token')) {
        // 認証後のコールバック処理
        console.log('Handling auth callback...');
        // 1秒待ってからURLを清潔にする（Supabaseの認証処理完了を待つ）
        setTimeout(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 1000);
      }
    };

    // ヘルパー関数は上部で定義済み

    const fetchInitialData = async () => {
      console.log('fetchInitialData: Starting for user:', {
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName
      });
      
      try {
        const { data: latestBudget, error: budgetError } = await getLatestBudget();

        console.log('🔍 getLatestBudget result:', { latestBudget, budgetError });

        if (budgetError) {
          console.error('❌ Budget error:', budgetError);
          setShowBudgetModal(true);
          return;
        }

        if (latestBudget) {
          console.log('✅ Latest budget found:', {
            id: latestBudget.id,
            amount: latestBudget.amount,
            transactions: latestBudget.transactions?.length || 0,
            created_at: latestBudget.created_at
          });

          // 今月の予算が設定されているかチェック
          const isCurrentMonth = isBudgetSetForCurrentMonth(latestBudget);
          console.log('📅 Is current month budget?', isCurrentMonth);

          if (isCurrentMonth) {
            console.log('🎯 Setting budget data to state...');
            setMonthlyBudget(latestBudget.amount);
            setCurrentBudgetId(latestBudget.id);
            setTransactions(latestBudget.transactions || []);
            // 収入と支出を分けて計算（legacy transactions without type field are treated as expenses）
            const transactions = latestBudget.transactions || [];
            const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const totalExpense = transactions.filter(t => !t.type || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const balance = latestBudget.amount + totalIncome - totalExpense;
            setCurrentBalance(balance);
            console.log('💰 State updated:', {
              monthlyBudget: latestBudget.amount,
              currentBudgetId: latestBudget.id,
              transactions: latestBudget.transactions?.length || 0,
              currentBalance: balance
            });
          } else {
            console.log('📅 Budget is not for current month, showing modal');
            setShowBudgetModal(true);
          }
        } else {
          console.log('❌ No budget data found, showing modal');
          setShowBudgetModal(true);
        }

        const { data: history } = await getBudgetHistory();
        if (history && history.length > 0) {
          setMonthlyHistory(history.slice(1));
        }
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // エラーは内部的に処理
      }
    };

    handleAuthCallback();

    // ユーザーがログインしている場合のみデータを取得
    if (user) {
      console.log('useEffect: User authenticated, fetching data...');
      // 少し遅延を入れて、Firebaseの認証状態が完全に同期されるのを待つ
      setTimeout(() => {
        fetchInitialData();
      }, 500);
    } else {
      console.log('useEffect: No user authenticated');
    }

    // Service Worker処理
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }
  }, [user]);

  // Status Bar設定（モバイル用）
  useEffect(() => {
    const setStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });
      } catch (error) {
        // Web環境では無視
      }
    };
    setStatusBar();
  }, []);

  // 認証ローディング中の表示
  if (loading) {
    return (
      <AppContainer>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#6b7280'
        }}>
          読み込み中...
        </div>
      </AppContainer>
    );
  }

  // 未ログインの場合は認証ページを表示
  if (!user) {
    return <AuthPage />;
  }

  // ヘルパー関数は上部で既に定義済み

  const isCurrentMonthBudgetSet = () => {
    return monthlyBudget > 0 && currentBudgetId;
  };

  const selectedJenres = (e) => {
    setSelectedRadioButton(e.target.value);
    setJenre(e.target.value);
  };

  const calculateGenrePercentages = () => {
    // 支出のみを対象とする（legacy transactions without type field are treated as expenses）
    const expenseTransactions = transactions.filter(t => !t.type || t.type === 'expense');
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const genreTotals = expenseTransactions.reduce((acc, t) => {
      acc[t.jenre] = (acc[t.jenre] || 0) + t.amount;
      return acc;
    }, {});

    return Object.entries(genreTotals).map(([genre, amount]) => ({
      genre,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      amount,
    }));
  };

  // 月次予算設定モーダルの処理
  const handleBudgetModalSubmit = () => {
    if (budgetInput && !isNaN(budgetInput) && parseFloat(budgetInput) > 0) {
      setBudgetConfirmStep(true);
    }
  };

  const handleBudgetModalConfirm = async () => {
    if (budgetInput && !isNaN(budgetInput)) {
      const newBudget = {
        amount: parseFloat(budgetInput),
        transactions: []
      };

      try {
        const { data, error } = await createNewBudget(newBudget);
        if (error) {
          alert('予算設定に失敗しました。もう一度お試しください。');
          return;
        }

        if (data) {
          if (monthlyBudget > 0) {
            setMonthlyHistory([
              {
                budget: monthlyBudget,
                transactions: transactions
              },
              ...monthlyHistory
            ]);
          }

          setMonthlyBudget(data.amount);
          setCurrentBudgetId(data.id);
          setCurrentBalance(data.amount);
          setTransactions([]);
          setBudgetInput('');
          setShowBudgetModal(false);
          setBudgetConfirmStep(false);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        alert('予算の設定中にエラーが発生しました。');
      }
    }
  };

  const handleBudgetModalCancel = () => {
    setBudgetConfirmStep(false);
    setBudgetInput('');
  };

  // 旧予算設定（ハンバーガーメニュー用）
  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (budgetInput && !isNaN(budgetInput) && parseFloat(budgetInput) > 0) {
      const newBudget = {
        amount: parseFloat(budgetInput),
        transactions: []
      };

      try {
        const { data, error } = await createNewBudget(newBudget);
        if (error) {
          alert('予算設定に失敗しました。もう一度お試しください。');
          return;
        }

        if (data) {
          if (monthlyBudget > 0) {
            setMonthlyHistory([
              {
                budget: monthlyBudget,
                transactions: transactions
              },
              ...monthlyHistory
            ]);
          }

          setMonthlyBudget(data.amount);
          setCurrentBudgetId(data.id);
          setCurrentBalance(data.amount);
          setTransactions([]);
          setBudgetInput('');
          setMenuOpen(false); // メニューを閉じる
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        alert('予算の設定中にエラーが発生しました。');
      }
    }
  };

  // 支出記録
  const handleAddExpense = async (e, transactionType = 'expense', note = '') => {
    e.preventDefault();
    if (expenseAmount && !isNaN(expenseAmount) && currentBudgetId) {
      const amount = parseFloat(expenseAmount);
      // 収入の場合は残高を増やし、支出の場合は減らす
      const balanceChange = transactionType === 'income' ? amount : -amount;
      const newBalance = currentBalance + balanceChange;

      const newTransaction = {
        amount: amount,
        date: new Date().toISOString(),
        remainingBalance: newBalance,
        jenre: selectedRadioButton,
        type: transactionType,
        note: note
      };

      try {
        const { data } = await updateBudgetTransactions(
          currentBudgetId,
          [...transactions, newTransaction]
        );

        if (data) {
          setTransactions(data.transactions);
          setCurrentBalance(newBalance);
          setExpenseAmount('');
        }
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // エラーは内部的に処理
      }
    }
  };

  // データの削除
  const deleteTransactionByIndex = async (index) => {
    if (!currentBudgetId) {
      // console.error("現在の予算IDがありません");
      return;
    }

    try {
      const { data: budget, error: fetchError } = await getLatestBudget();
      if (fetchError) {
        // console.error("取引データの取得に失敗しました:", fetchError);
        return;
      }

      const updatedTransactions = budget.transactions.filter((_, i) => i !== index);

      const { error: updateError } = await updateBudgetTransactions(currentBudgetId, updatedTransactions);
      if (updateError) {
        // console.error("取引データの更新に失敗しました:", updateError);
        return;
      }

      setTransactions(updatedTransactions);
      // 収入と支出を分けて計算（legacy transactions without type field are treated as expenses）
      const totalIncome = updatedTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = updatedTransactions.filter(t => !t.type || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const newBalance = monthlyBudget + totalIncome - totalExpense;
      setCurrentBalance(newBalance);

      const { data: updatedHistory } = await getBudgetHistory();
      if (updatedHistory && updatedHistory.length > 0) {
        setMonthlyHistory(updatedHistory.slice(1));
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // console.error("取引削除中にエラーが発生しました:", error);
    }
  };

  // Service Worker処理をメインのuseEffectに統合済み

  return (
    <AppContainer>
      <MainContainer>
        <Header>
          <UserInfo>
            <UserEmail>{user?.email}</UserEmail>
            <LogoutButton onClick={() => signOut()}>
              ログアウト
            </LogoutButton>
          </UserInfo>

          <HamburgerButton onClick={() => setMenuOpen(!menuOpen)}>
            <HamburgerIcon className={menuOpen ? 'open' : ''}>
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
            </HamburgerIcon>
          </HamburgerButton>
          <Title data-text="WEALTH TRACKER">WEALTH TRACKER</Title>
          <Subtitle>Master Your Monthly Budget</Subtitle>
        </Header>

        <ContentGrid>
          <AnimatedSection delay="0.1s">
            <RemainingAmountMeter
              currentBalance={currentBalance}
              monthlyBudget={monthlyBudget}
              onAddExpense={() => setShowExpenseForm(!showExpenseForm)}
              showExpenseForm={showExpenseForm}
            />
          </AnimatedSection>

          {transactions.length > 0 && (
            <AnimatedSection delay="0.2s">
              <GenreBreakdown
                genreData={calculateGenrePercentages()}
              />
            </AnimatedSection>
          )}

          <AnimatedSection delay="0.3s">
            <BalanceDisplay
              monthlyBudget={monthlyBudget}
              currentBalance={currentBalance}
            />
          </AnimatedSection>

        </ContentGrid>

        <ModalContainer />

        {/* 支出入力モーダル */}
        <ExpenseOverlay
          isOpen={showExpenseForm}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExpenseForm(false);
            }
          }}
        />
        <ExpenseModal isOpen={showExpenseForm}>
          <ExpenseModalHeader>
            <ExpenseModalTitle>収支を入力</ExpenseModalTitle>
            <CloseButton onClick={() => setShowExpenseForm(false)}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </CloseButton>
          </ExpenseModalHeader>

          <TransactionInput
            key={categoryRefreshKey}
            expenseAmount={expenseAmount}
            switchingButton={true}
            selectedRadioButton={selectedRadioButton}
            setExpenseAmount={setExpenseAmount}
            setSwitchingButton={() => setShowExpenseForm(false)}
            handleAddExpense={(e, transactionType, note) => {
              handleAddExpense(e, transactionType, note);
              setShowExpenseForm(false);
            }}
            selectedJenres={selectedJenres}
            isModal={true}
          />
        </ExpenseModal>


        {/* モーダル形式のハンバーガーメニュー */}
        <MenuOverlay isOpen={menuOpen} onClick={() => setMenuOpen(false)} />
        <MenuModal isOpen={menuOpen}>
          <ModalHeader>
            <ModalTitle>メニュー</ModalTitle>
            <CloseButton onClick={() => setMenuOpen(false)}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </CloseButton>
          </ModalHeader>

          <MenuContent>
            {/* カテゴリー管理 */}
            <CategoryManager onCategoryChange={() => {
              // カテゴリーが変更されたときにTransactionInputを強制更新
              console.log('Category changed, refreshing transaction input');
              setCategoryRefreshKey(prev => prev + 1);
            }} />

            {/* 月次設定ボタン - 未設定時は通常のBudgetSetting、設定済み時はモーダル開くボタン */}
            {!isCurrentMonthBudgetSet() ? (
              <BudgetSetting
                budgetInput={budgetInput}
                setBudgetInput={setBudgetInput}
                handleSetBudget={handleSetBudget}
              />
            ) : (
              <BudgetSettingButton
                onClick={() => {
                  setBudgetInput(''); // モーダルを開く前にリセット
                  setShowBudgetModal(true);
                  setMenuOpen(false);
                }}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                月次予算を設定
              </BudgetSettingButton>
            )}

            <TransactionHistoryUpdated
              transactions={transactions}
              deleteTransactionByIndex={deleteTransactionByIndex}
            />

            <MonthlyHistory
              monthlyHistory={monthlyHistory}
            />
          </MenuContent>
        </MenuModal>

        {/* 月次予算設定モーダル */}
        <BudgetSetupOverlay
          isOpen={showBudgetModal}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBudgetModal(false);
              setBudgetConfirmStep(false);
              setBudgetInput('');
            }
          }}
        />
        <BudgetSetupModal isOpen={showBudgetModal}>
          <BudgetSetupHeader>
            <BudgetSetupTitle>
              {getCurrentMonth().split('-')[1]}月の予算を設定
            </BudgetSetupTitle>
            <BudgetSetupSubtitle>
              今月の予算を設定してください
            </BudgetSetupSubtitle>
            <CloseButton
              onClick={() => {
                setShowBudgetModal(false);
                setBudgetConfirmStep(false);
                setBudgetInput('');
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px'
              }}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </CloseButton>
          </BudgetSetupHeader>

          <BudgetSetupContent>
            {budgetConfirmStep ? (
              // 確認ステップ
              <>
                <BudgetConfirmSection>
                  <BudgetConfirmAmount>
                    ¥{parseFloat(budgetInput || 0).toLocaleString()}
                  </BudgetConfirmAmount>
                  <BudgetConfirmText>
                    この金額で{getCurrentMonth().split('-')[1]}月の予算を設定しますか？
                  </BudgetConfirmText>
                </BudgetConfirmSection>

                <BudgetActionButtons>
                  <BudgetActionButton onClick={handleBudgetModalCancel}>
                    戻る
                  </BudgetActionButton>
                  <BudgetActionButton primary onClick={handleBudgetModalConfirm}>
                    設定する
                  </BudgetActionButton>
                </BudgetActionButtons>
              </>
            ) : (
              // 入力ステップ
              <>
                <BudgetSetting
                  budgetInput={budgetInput}
                  setBudgetInput={setBudgetInput}
                  handleSetBudget={(e) => {
                    e.preventDefault();
                    handleBudgetModalSubmit();
                  }}
                />

                <BudgetActionButtons>
                  <BudgetActionButton primary onClick={handleBudgetModalSubmit}>
                    確認画面へ
                  </BudgetActionButton>
                </BudgetActionButtons>
              </>
            )}
          </BudgetSetupContent>
        </BudgetSetupModal>
      </MainContainer>
    </AppContainer>
  );
}

export default BudgetApp;