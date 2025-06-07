import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  getLatestBudget,
  createNewBudget,
  updateBudgetTransactions,
  getBudgetHistory
} from '../utils/supabaseFunctions';
import ExpenseInput from './components/ExpenseInput';
import BudgetSetting from './components/BudgetSetting';
import BalanceDisplay from './components/BalanceDisplay';
import TransactionHistory from './components/TransactionHistory';
import MonthlyHistory from './components/MonthlyHistory';
import RemainingAmountMeter from './components/RemainingAmountMeter';
import GenreBreakdown from './components/GenreBreakdown';

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
      top: ${props => props.isOpen ? '50%' : '25%'};
      transform: ${props => props.isOpen ? 
        'translateY(-50%) rotate(45deg)' : 
        'translateY(-50%)'};
    }
    
    &:nth-child(2) {
      top: 50%;
      transform: translateY(-50%);
      opacity: ${props => props.isOpen ? '0' : '1'};
    }
    
    &:nth-child(3) {
      top: ${props => props.isOpen ? '50%' : '75%'};
      transform: ${props => props.isOpen ? 
        'translateY(-50%) rotate(-45deg)' : 
        'translateY(-50%)'};
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
  // 状態管理
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [selectedRadioButton, setSelectedRadioButton] = useState("食費");
  const [jenre, setJenre] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  const [switchingButton, setSwitchingButton] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetConfirmStep, setBudgetConfirmStep] = useState(false);

  // 現在の月をチェックする関数
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // 最新の予算が今月のものかチェックする関数
  const isBudgetSetForCurrentMonth = (latestBudget) => {
    if (!latestBudget || !latestBudget.created_at) return false;
    
    const budgetDate = new Date(latestBudget.created_at);
    const budgetMonth = `${budgetDate.getFullYear()}-${String(budgetDate.getMonth() + 1).padStart(2, '0')}`;
    const currentMonth = getCurrentMonth();
    
    return budgetMonth === currentMonth;
  };

  // 現在月の予算が設定済みかどうかをチェック
  const isCurrentMonthBudgetSet = () => {
    return monthlyBudget > 0 && currentBudgetId;
  };

  // ジャンルを選択した時の制御
  const selectedJenres = (e) => {
    setSelectedRadioButton(e.target.value);
    setJenre(e.target.value);
  }

  // ジャンルごとの支出割合を計算
  const calculateGenrePercentages = () => {
    const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
    const genreTotals = transactions.reduce((acc, t) => {
      acc[t.jenre] = (acc[t.jenre] || 0) + t.amount;
      return acc;
    }, {});

    return Object.entries(genreTotals).map(([genre, amount]) => ({
      genre,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      amount,
    }));
  };

  // 初期データ読み込み
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: latestBudget } = await getLatestBudget();
        
        // 今月の予算が設定されているかチェック
        if (latestBudget && isBudgetSetForCurrentMonth(latestBudget)) {
          setMonthlyBudget(latestBudget.amount);
          setCurrentBudgetId(latestBudget.id);
          setTransactions(latestBudget.transactions || []);
          setCurrentBalance(
            latestBudget.amount -
            (latestBudget.transactions || []).reduce((sum, t) => sum + t.amount, 0)
          );
        } else {
          // 今月の予算が未設定の場合、モーダルを表示
          setShowBudgetModal(true);
        }

        const { data: history } = await getBudgetHistory();
        if (history && history.length > 0) {
          setMonthlyHistory(history.slice(1));
        }
      } catch (error) {
        console.error('初期データ取得エラー:', error);
      }
    };

    fetchInitialData();
  }, []);

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
        const { data } = await createNewBudget(newBudget);
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
        console.error('予算設定エラー:', error);
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
    if (budgetInput && !isNaN(budgetInput)) {
      const newBudget = {
        amount: parseFloat(budgetInput),
        transactions: []
      };

      try {
        const { data } = await createNewBudget(newBudget);
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
        }
      } catch (error) {
        console.error('予算設定エラー:', error);
      }
    }
  };

  // 支出記録
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (expenseAmount && !isNaN(expenseAmount) && currentBudgetId) {
      const expense = parseFloat(expenseAmount);
      const newBalance = currentBalance - expense;

      const newTransaction = {
        amount: expense,
        date: new Date().toLocaleDateString(),
        remainingBalance: newBalance,
        jenre: selectedRadioButton,
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
      } catch (error) {
        console.error('支出記録エラー:', error);
      }
    }
  };

  // データの削除
  const deleteTransactionByIndex = async (index) => {
    if (!currentBudgetId) {
      console.error("現在の予算IDがありません");
      return;
    }

    try {
      const { data: budget, error: fetchError } = await getLatestBudget();
      if (fetchError) {
        console.error("取引データの取得に失敗しました:", fetchError);
        return;
      }

      const updatedTransactions = budget.transactions.filter((_, i) => i !== index);

      const { error: updateError } = await updateBudgetTransactions(currentBudgetId, updatedTransactions);
      if (updateError) {
        console.error("取引データの更新に失敗しました:", updateError);
        return;
      }

      setTransactions(updatedTransactions);
      const newBalance = monthlyBudget - updatedTransactions.reduce((sum, t) => sum + t.amount, 0);
      setCurrentBalance(newBalance);

      const { data: updatedHistory } = await getBudgetHistory();
      if (updatedHistory && updatedHistory.length > 0) {
        setMonthlyHistory(updatedHistory.slice(1));
      }
    } catch (error) {
      console.error("取引削除中にエラーが発生しました:", error);
    }
  };

  // Service Workerを管理する
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = `${window.location.origin}/service-worker.js`;
        navigator.serviceWorker
          .register(swUrl)
          .then(registration => {
            console.log('Service Worker登録成功:', registration);
          })
          .catch(error => {
            console.error('Service Worker登録失敗:', error);
          });
      });
    }
  }, []);

  return (
    <AppContainer>
      <MainContainer>
        <Header>
          <HamburgerButton onClick={() => setMenuOpen(!menuOpen)}>
            <HamburgerIcon isOpen={menuOpen}>
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
            <ExpenseModalTitle>支出を入力</ExpenseModalTitle>
            <CloseButton onClick={() => setShowExpenseForm(false)}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </CloseButton>
          </ExpenseModalHeader>
          
          <ExpenseInput
            expenseAmount={expenseAmount}
            switchingButton={true}
            selectedRadioButton={selectedRadioButton}
            setSelectedRadioButton={setSelectedRadioButton}
            setExpenseAmount={setExpenseAmount}
            setSwitchingButton={() => setShowExpenseForm(false)}
            handleAddExpense={(e) => {
              handleAddExpense(e);
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
            {!isCurrentMonthBudgetSet() && (
              <BudgetSetting
                budgetInput={budgetInput}
                setBudgetInput={setBudgetInput}
                handleSetBudget={handleSetBudget}
              />
            )}

            <TransactionHistory
              transactions={transactions}
              deleteTransactionByIndex={deleteTransactionByIndex}
              selectedRadioButton={selectedRadioButton}
              jenre={jenre}
            />

            <MonthlyHistory
              monthlyHistory={monthlyHistory}
            />
          </MenuContent>
        </MenuModal>

        {/* 月次予算設定モーダル */}
        <BudgetSetupOverlay isOpen={showBudgetModal} />
        <BudgetSetupModal isOpen={showBudgetModal}>
          <BudgetSetupHeader>
            <BudgetSetupTitle>
              {getCurrentMonth().split('-')[1]}月の予算を設定
            </BudgetSetupTitle>
            <BudgetSetupSubtitle>
              今月の予算を設定してください
            </BudgetSetupSubtitle>
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