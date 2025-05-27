const ExpenseInput = ({
  styles,
  expenseAmount,
  switchingButton,
  setExpenseAmount,
  setSwitchingButton,
  handleAddExpense,
}) => {
  return (
    <>
      <div style={styles.section}>
        <button
          onClick={() => setSwitchingButton((prev) => !prev)}
          style={styles.toggleButton}
        >
          {switchingButton ? "入力フォームを閉じる" : "支出を入力する"}
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
    </>
  );
};

export default ExpenseInput;
