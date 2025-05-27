import { useState } from "react";
import { createPortal } from "react-dom";
import ModalDelete from "./ModalDelete";

const ModalPortal = ({ children }) => {
  const target = document.querySelector(".container.modal");
  if (!target) return null;
  return createPortal(children, target);
};

const TransactionHistory = ({
  styles,
  transactions,
  deleteTransactionByIndex,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>取引履歴</h2>
        {transactions.length === 0 ? (
          <p style={{ color: "#6b7280" }}>取引記録はまだありません</p>
        ) : (
          <div>
            {transactions.map((transaction, index) => (
              <div key={index} style={styles.transactionItem}>
                <div>
                  <span style={styles.expenseAmount}>
                    -{transaction.amount.toLocaleString()}円
                  </span>
                  <span style={styles.transactionDate}>
                    ({transaction.date})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedIndex(index);
                    setModalOpen(true);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {modalOpen && (
              <ModalPortal>
                <ModalDelete
                  deleteTransactionByIndex={() => {
                    if (selectedIndex !== null) {
                      deleteTransactionByIndex(selectedIndex);
                    }
                    setModalOpen(false);
                  }}
                  handleCloseClick={() => setModalOpen(false)}
                />
              </ModalPortal>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TransactionHistory;
