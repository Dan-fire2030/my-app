const BudgetSetting = ({
  styles,
  budgetInput,
  setBudgetInput,
  handleSetBudget,
}) => {
  return (
    <>
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
        <p style={styles.note}>
          ※新しい予算を設定すると、取引履歴はリセットされます
        </p>
      </div>
    </>
  );
};

export default BudgetSetting;
