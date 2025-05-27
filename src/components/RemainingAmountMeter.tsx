const RemainingAmountMeter = ({ currentBalance, monthlyBudget }) => {
  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            width: "100%",
            height: "20px",
            backgroundColor: "#ef4444",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.max((currentBalance / monthlyBudget) * 100, 0)}%`,
              height: "100%",
              backgroundColor: currentBalance < 0 ? "#ef4444" : "#10b981",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <p
          style={{
            textAlign: "right",
            color: currentBalance < 0 ? "#ef4444" : "#10b981",
          }}
        >
          {monthlyBudget > 0
            ? ((currentBalance / monthlyBudget) * 100).toFixed(1) + "%"
            : "100.0%"}
        </p>
      </div>
    </>
  );
};

export default RemainingAmountMeter;
