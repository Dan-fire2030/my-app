import { useState, useEffect } from 'react';
import {
  getLatestBudget,
  createNewBudget,
  updateBudgetTransactions,
  getBudgetHistory
} from '../utils/supabaseFunctions';

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

      {/* 支出入力セクション */}
      <div style={styles.section}>

        {/* 残り金額と支出金額の表示 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#ef4444',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.max((currentBalance / monthlyBudget) * 100, 0)}%`,
              height: '100%',
              backgroundColor: currentBalance < 0 ? '#ef4444' : '#10b981',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{ textAlign: 'right', color: currentBalance < 0 ? '#ef4444' : '#10b981' }}>
            {monthlyBudget > 0
              ? ((currentBalance / monthlyBudget) * 100).toFixed(1) + '%'
              : '100.0%'}
          </p>
        </div>

        <h2>残りの金額：{currentBalance.toLocaleString()}</h2>
        <h2>支出金額：{expenseAmount}</h2>

        <button
          onClick={() => setSwitchingButton(prev => !prev)}
          style={styles.toggleButton}
        >
          {switchingButton ? '入力フォームを閉じる' : '支出を入力する'}
        </button>

        {switchingButton && (
          <div style={styles.expenseFormContainer}>
            <div style={styles.inputGroup}>
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                style={styles.input}
                placeholder="支出金額を入力"
              />
              <button
                onClick={(e) => handleAddExpense(e)}
                style={{ ...styles.button, ...styles.buttonSuccess }}
              >
                記録
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setHiddenButton(prev => !prev)}
        style={styles.toggleButton}
      >
        {hiddenButton ? '入力フォームを閉じる' : '---'}
      </button>

      {hiddenButton && (
        <div>
          {/* 予算設定セクション */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>月次予算設定</h2>
            <div style={styles.inputGroup}>
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                style={styles.input}
                placeholder="予算を入力"
              />
              <button
                onClick={handleSetBudget}
                style={{ ...styles.button, ...styles.buttonPrimary }}
              >
                設定
              </button>
            </div>
            <p style={styles.note}>※新しい予算を設定すると、取引履歴はリセットされます</p>
          </div>

          {/* 残高表示 */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>現在の状況</h2>
            <div style={styles.flexBetween}>
              <span>設定予算:</span>
              <span style={{ fontWeight: '500' }}>{monthlyBudget.toLocaleString()}円</span>
            </div>
            <div style={styles.flexBetween}>
              <span>残り金額:</span>
              <span style={currentBalance < 0 ? styles.balanceNegative : styles.balancePositive}>
                {currentBalance.toLocaleString()}円
              </span>
            </div>
          </div>

          {/* 取引履歴 */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>取引履歴</h2>
            {transactions.length === 0 ? (
              <p style={{ color: '#6b7280' }}>取引記録はまだありません</p>
            ) : (
              <div>
                {transactions.map((transaction, index) => (
                  <div key={index} style={styles.transactionItem}>
                    <div>
                      <span style={styles.expenseAmount}>-{transaction.amount.toLocaleString()}円</span>
                      <span style={styles.transactionDate}>({transaction.date})</span>
                    </div>
                    <span style={transaction.remainingBalance < 0 ? styles.balanceNegative : styles.balancePositive}>
                      残高: {transaction.remainingBalance.toLocaleString()}円
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 月次履歴 */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>月次履歴</h2>
            {monthlyHistory.length === 0 ? (
              <p style={{ color: '#6b7280' }}>月次履歴はまだありません</p>
            ) : (
              <ul style={{ paddingLeft: '1em', margin: 0 }}>
                {monthlyHistory.map((history, index) => (
                  <li key={index} style={{ marginBottom: '12px', listStyle: 'disc' }}>
                    <span>予算: {history.budget.toLocaleString()}円</span>
                    <ul style={{ paddingLeft: '1.5em', marginTop: '4px' }}>
                      {history.transactions.map((transaction, transIndex) => (
                        <li key={transIndex} style={{ marginBottom: '4px', listStyle: 'circle' }}>
                          <span style={styles.expenseAmount}>
                            -{transaction.amount.toLocaleString()}円
                          </span>
                          <span style={styles.transactionDate}>
                            ({transaction.date})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetApp;