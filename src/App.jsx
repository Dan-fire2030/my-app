import { useState } from 'react';

const BudgetApp = () => {
  // 状態管理
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [transactions, setTransactions] = useState([]);

  const [switchingButton, setSwitchingButton] = useState(false);

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
    }
  };

  // 予算を設定する関数
  const handleSetBudget = () => {
    if (budgetInput && !isNaN(budgetInput)) {
      const newBudget = parseFloat(budgetInput);
      setMonthlyBudget(newBudget);
      setCurrentBalance(newBudget);
      // 取引履歴をリセット
      setTransactions([]);
      setBudgetInput('');
    }
  };

  // 支出を記録する関数
  const handleAddExpense = () => {
    if (expenseAmount && !isNaN(expenseAmount)) {
      const expense = parseFloat(expenseAmount);
      const newBalance = currentBalance - expense;

      // 新しい取引を記録
      const newTransaction = {
        id: Date.now(),
        amount: expense,
        date: new Date().toLocaleDateString(),
        remainingBalance: newBalance
      };

      setTransactions([newTransaction, ...transactions]);
      setCurrentBalance(newBalance);
      setExpenseAmount('');
    }
  };

  const switchingFunction = () => setSwitchingButton(prev => !prev);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>家計簿アプリ</h1>

      {/* 予算設定セクション */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>月次予算設定</h2>
        <button style={styles.inputGroup} onClick={switchingFunction}>
          {switchingButton && `
          <input
            type="number"
            value={${budgetInput}}
            onChange={${(e) => setBudgetInput(e.target.value)}}
            style={${styles.input}}
            placeholder="予算を入力"
          />
          <button
            onClick={${handleSetBudget}}
            style={${{ ...styles.button, ...styles.buttonPrimary }}}
          >
            設定
          </button>`}
          支出を入力
        </button>
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

      {/* 支出入力セクション */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>支出を記録</h2>
        <div style={styles.inputGroup}>
          <input
            type="number"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            style={styles.input}
            placeholder="支出金額を入力"
          />
          <button
            onClick={handleAddExpense}
            style={{ ...styles.button, ...styles.buttonSuccess }}
          >
            記録
          </button>
        </div>
      </div>

      {/* 取引履歴 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>取引履歴</h2>
        {transactions.length === 0 ? (
          <p style={{ color: '#6b7280' }}>取引記録はまだありません</p>
        ) : (
          <div>
            {transactions.map(transaction => (
              <div key={transaction.id} style={styles.transactionItem}>
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
    </div>
  );
}

export default BudgetApp;