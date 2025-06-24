// App.jsx - fetch interceptorを削除

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
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
  background: linear-gradient(135deg, #fef7ff 0%, #f0f9ff 50%, #f0fff4 100%);
  padding: 16px;
  
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
`;

const UserInfo = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    position: static;
    margin-bottom: 16px;
    justify-content: center;
  }
`;

const UserEmail = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  
  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    transform: translateY(-1px);
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
  background: linear-gradient(135deg, #FFE4E6, #F3E8FF);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 30;
  box-shadow: 0 4px 20px rgba(251, 207, 232, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(251, 207, 232, 0.4);
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
  
  .line {
    position: absolute;
    width: 100%;
    height: 2px;
    background: linear-gradient(45deg, #9333EA, #EC4899);
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
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  padding: 32px;
  overflow-y: auto;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
  
  @media (max-width: 640px) {
    width: 95vw;
    padding: 24px;
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
  background: rgba(0, 0, 0, 0.5);
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
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 50%, #F59E0B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
    transform: scale(1.05);
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: #6b7280;
  }
`;

const MenuContent = styled.div`
  display: grid;
  gap: 24px;
`;

// バーガーメニュー用の月次設定ボタン
const BudgetSettingButton = styled.button`
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
  }
  
  svg {
    width: 20px;
    height: 20px;
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
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 50%, #F59E0B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
  
  @media (max-width: 640px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  color: #7C3AED;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.8;
  margin-top: 4px;
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
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  padding: 32px;
  overflow-y: auto;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
  
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
  background: rgba(0, 0, 0, 0.5);
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
  border-bottom: 1px solid #e5e7eb;
`;

const ExpenseModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  z-index: 1002;
  padding: 40px;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
  
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
`;

const BudgetSetupTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
`;

const BudgetSetupSubtitle = styled.p`
  color: #6b7280;
  font-size: 16px;
  margin: 0;
`;

const BudgetSetupContent = styled.div`
  display: grid;
  gap: 24px;
`;

const BudgetConfirmSection = styled.div`
  background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const BudgetConfirmAmount = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 8px;
`;

const BudgetConfirmText = styled.p`
  color: #374151;
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
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
  ` : `
    background: #f3f4f6;
    color: #374151;
    
    &:hover {
      background: #e5e7eb;
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

  // ヘルパー関数を定義
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

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
        date: new Date().toLocaleDateString(),
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
          <Title>家計簿アプリ</Title>
          <Subtitle>毎月の収支を賢く管理しよう</Subtitle>
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
              // カテゴリーが変更された時の処理があればここに記述
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
                top: '20px',
                right: '20px'
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