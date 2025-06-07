import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #6b7280;
  padding: 40px 0;
`;

const TransactionList = styled.div`
  display: grid;
  gap: 12px;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-height: 72px;
  
  &:hover {
    background-color: #f3f4f6;
  }
`;

const TransactionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const GenreIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background-color: ${props => props.bgColor};
  color: ${props => props.color};
`;

const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const TransactionAmount = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
`;

const TransactionGenre = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const TransactionDate = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
`;

const DeleteButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e5e7eb;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #fee2e2;
    color: #ef4444;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ConfirmDeleteButton = styled.button`
  padding: 6px 12px;
  background-color: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #dc2626;
  }
`;

const CancelButton = styled.button`
  padding: 6px 12px;
  background-color: #f3f4f6;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const TransactionHistory = ({
  transactions,
  deleteTransactionByIndex,
}) => {
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null);

  const genreConfig = {
    食費: { icon: "🍽️", color: "#ea580c", bgColor: "#fff7ed" },
    交通費: { icon: "🚃", color: "#2563eb", bgColor: "#eff6ff" },
    娯楽費: { icon: "🎮", color: "#7c3aed", bgColor: "#f3e8ff" },
    その他: { icon: "📦", color: "#4b5563", bgColor: "#f9fafb" },
  };

  return (
    <Container>
      <Title>取引履歴</Title>
      
      {transactions.length === 0 ? (
        <EmptyMessage>取引記録はまだありません</EmptyMessage>
      ) : (
        <TransactionList>
          {transactions.map((transaction, index) => {
            const config = genreConfig[transaction.jenre] || genreConfig["その他"];
            
            return (
              <TransactionItem key={index}>
                <TransactionLeft>
                  <GenreIcon bgColor={config.bgColor} color={config.color}>
                    {config.icon}
                  </GenreIcon>
                  <TransactionInfo>
                    <TransactionAmount>
                      ¥{transaction.amount.toLocaleString()}
                    </TransactionAmount>
                    <TransactionGenre>
                      {transaction.jenre}
                    </TransactionGenre>
                  </TransactionInfo>
                </TransactionLeft>

                <TransactionDate>
                  {transaction.date}
                </TransactionDate>

                <ActionButtons>
                  {deleteConfirmIndex === index ? (
                    <ConfirmButtons>
                      <ConfirmDeleteButton
                        onClick={() => {
                          deleteTransactionByIndex(index);
                          setDeleteConfirmIndex(null);
                        }}
                      >
                        削除
                      </ConfirmDeleteButton>
                      <CancelButton
                        onClick={() => setDeleteConfirmIndex(null)}
                      >
                        キャンセル
                      </CancelButton>
                    </ConfirmButtons>
                  ) : (
                    <DeleteButton
                      onClick={() => setDeleteConfirmIndex(index)}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </DeleteButton>
                  )}
                </ActionButtons>
              </TransactionItem>
            );
          })}
        </TransactionList>
      )}
    </Container>
  );
};

export default TransactionHistory;