const MonthlyHistory = ({ styles, monthlyHistory }) => {
  return (
    <>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>月次履歴</h2>
        {monthlyHistory.length === 0 ? (
          <p style={{ color: "#6b7280" }}>月次履歴はまだありません</p>
        ) : (
          <ul style={{ paddingLeft: "1em", margin: 0 }}>
            {monthlyHistory.map((history, index) => (
              <li
                key={index}
                style={{ marginBottom: "12px", listStyle: "disc" }}
              >
                <span>予算: {history.budget.toLocaleString()}円</span>
                <ul style={{ paddingLeft: "1.5em", marginTop: "4px" }}>
                  {history.transactions.map((transaction, transIndex) => (
                    <li
                      key={transIndex}
                      style={{ marginBottom: "4px", listStyle: "circle" }}
                    >
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
    </>
  );
};

export default MonthlyHistory;
