import { useState, useEffect } from 'react';
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

const BudgetApp = () => {

  // 状態管理
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  const [switchingButton, setSwitchingButton] = useState(false);
  const [hiddenButton, setHiddenButton] = useState(false);

  // スタイル定義
  const styles = {
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '24px',
      color: '#1f2937'
    },
    section: {
      marginBottom: '24px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '6px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#374151'
    },
    inputGroup: {
      display: 'flex',
      gap: '8px'
    },
    input: {
      flexGrow: 1,
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '16px'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer'
    },
    buttonPrimary: {
      backgroundColor: '#3b82f6',
    },
    buttonSuccess: {
      backgroundColor: '#10b981',
    },
    toggleButton: {
      backgroundColor: '#6366f1',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      width: '100%'
    },
    flexBetween: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    balancePositive: {
      fontWeight: 'bold',
      color: '#10b981'
    },
    balanceNegative: {
      fontWeight: 'bold',
      color: '#ef4444'
    },
    transactionItem: {
      display: 'flex',
      justifyContent: 'space-between',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '8px',
      marginBottom: '8px'
    },
    expenseAmount: {
      color: '#ef4444'
    },
    transactionDate: {
      color: '#6b7280',
      fontSize: '14px',
      marginLeft: '8px'
    },
    note: {
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '8px'
    },
    expenseFormContainer: {
      marginTop: '12px'
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: latestBudget } = await getLatestBudget();
        if (latestBudget) {
          setMonthlyBudget(latestBudget.amount);
          setCurrentBudgetId(latestBudget.id);
          setTransactions(latestBudget.transactions || []);
          setCurrentBalance(
            latestBudget.amount -
            (latestBudget.transactions || []).reduce((sum, t) => sum + t.amount, 0)
          );
        }

        const { data: history } = await getBudgetHistory();
        if (history && history.length > 0) {
          // 最新のものを除外して履歴として表示
          setMonthlyHistory(history.slice(1));
        }
      } catch (error) {
        console.error('初期データ取得エラー:', error);
      }
    };

    fetchInitialData();
  }, []);

  // 予算設定
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
          // 現在の予算を履歴に追加
          if (monthlyBudget > 0) {
            setMonthlyHistory([
              {
                budget: monthlyBudget,
                transactions: transactions
              },
              ...monthlyHistory
            ]);
          }

          // 新しい予算をセット
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
        remainingBalance: newBalance
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
      // Supabaseから現在のtransactionsを取得
      const { data: budget, error: fetchError } = await getLatestBudget();
      if (fetchError) {
        console.error("取引データの取得に失敗しました:", fetchError);
        return;
      }

      // transactions配列から指定されたインデックスを削除
      const updatedTransactions = budget.transactions.filter((_, i) => i !== index);

      // Supabaseに更新されたtransactionsを保存
      const { error: updateError } = await updateBudgetTransactions(currentBudgetId, updatedTransactions);
      if (updateError) {
        console.error("取引データの更新に失敗しました:", updateError);
        return;
      }

      // ローカル状態を更新
      setTransactions(updatedTransactions);

      // 残高を再計算
      const newBalance = monthlyBudget - updatedTransactions.reduce((sum, t) => sum + t.amount, 0);
      setCurrentBalance(newBalance);

      // 履歴データを更新
      const { data: updatedHistory } = await getBudgetHistory();
      if (updatedHistory && updatedHistory.length > 0) {
        setMonthlyHistory(updatedHistory.slice(1)); // 最新のものを除外して履歴として表示
      }
    } catch (error) {
      console.error("取引削除中にエラーが発生しました:", error);
    }
  };

  // Service Workerを管理する
  useEffect(() => {
    // 既存のService Workerを一旦解除
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }

    // 新しくService Workerを登録する
    // ポート番号の修正（5173から別のポートへ変更）を含む
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
    <div style={styles.container}>
      <h1 style={styles.header}>家計簿アプリ</h1>

      <div className="container modal"></div>

      {/* 残量メーター */}
      <RemainingAmountMeter
        currentBalance={currentBalance}
        monthlyBudget={monthlyBudget}
      />

      {/* 残り金額と支出金額の表示 */}
      <BalanceDisplay
        styles={styles}
        monthlyBudget={monthlyBudget}
        currentBalance={currentBalance}
      />

      {/* 支出入力セクション */}
      <ExpenseInput
        styles={styles}
        expenseAmount={expenseAmount}
        switchingButton={switchingButton}
        setExpenseAmount={setExpenseAmount}
        setSwitchingButton={setSwitchingButton}
        handleAddExpense={handleAddExpense}
      />

      <button
        onClick={() => setHiddenButton(prev => !prev)}
        style={styles.toggleButton}
      >
        {hiddenButton ? '入力フォームを閉じる' : '予算の設定　履歴の確認'}
      </button>

      {hiddenButton && (
        <div>
          {/* 予算設定セクション */}
          <BudgetSetting
            styles={styles}
            budgetInput={budgetInput}
            setBudgetInput={setBudgetInput}
            handleSetBudget={handleSetBudget}
          />

          {/* 取引履歴 */}
          <TransactionHistory
            styles={styles}
            transactions={transactions}
            deleteTransactionByIndex={deleteTransactionByIndex}
          />

          {/* 月次履歴 */}
          <MonthlyHistory
            styles={styles}
            monthlyHistory={monthlyHistory}
          />
        </div>
      )}
    </div>
  );
}

export default BudgetApp;