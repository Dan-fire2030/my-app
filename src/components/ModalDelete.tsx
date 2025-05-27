import { CSSProperties } from "react";

const ModalDelete = ({ deleteTransactionByIndex, handleCloseClick }) => {
  const styles: { [key: string]: CSSProperties } = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modal: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      textAlign: "center" as const,
      width: "300px",
    },
    title: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "16px",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "16px",
    },
    button: {
      padding: "8px 16px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontWeight: "500",
    },
    buttonConfirm: {
      backgroundColor: "#ef4444",
      color: "white",
    },
    buttonCancel: {
      backgroundColor: "#d1d5db",
      color: "#374151",
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>本当に削除しますか？</h2>
        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.buttonConfirm }}
            onClick={() => {
              deleteTransactionByIndex();
              handleCloseClick();
            }}
          >
            はい
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonCancel }}
            onClick={handleCloseClick}
          >
            いいえ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDelete;
