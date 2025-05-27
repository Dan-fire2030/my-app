const BalanceDisplay = ({ styles, monthlyBudget, currentBalance }) => {
  return (
    <>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>現在の状況</h2>
        <div style={styles.flexBetween}>
          <span>設定予算:</span>
          <span style={{ fontWeight: "500" }}>
            {monthlyBudget.toLocaleString()}円
          </span>
        </div>
        <div style={styles.flexBetween}>
          <span>残り金額:</span>
          <span
            style={
              currentBalance < 0
                ? styles.balanceNegative
                : styles.balancePositive
            }
          >
            {currentBalance.toLocaleString()}円
          </span>
        </div>
      </div>
    </>
  );
};

export default BalanceDisplay;
