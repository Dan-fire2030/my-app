import { useState, useEffect } from "react";
import styled from "styled-components";
import { categoryService } from '../services/categoryService';
import { Category, TransactionType } from '../utils/types';
import { useAuth } from '../contexts/FirebaseAuthContext';

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
  border-radius: 12px;
  transition: all 0.2s ease;
  min-height: 72px;
  
  &:hover {
    background-color: #f3f4f6;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TransactionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const GenreIcon = styled.div<{ $bgColor: string; $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${props => props.$bgColor};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
`;

const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TransactionAmount = styled.div<{ $isIncome: boolean }>`
  font-weight: 600;
  font-size: 16px;
  color: ${props => props.$isIncome ? '#10b981' : '#ef4444'};
`;

const TransactionDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
`;

const TransactionGenre = styled.span`
  font-weight: 500;
`;

const TransactionNote = styled.span`
  font-style: italic;
  opacity: 0.8;
`;

const TransactionDate = styled.div`
  font-size: 14px;
  color: #6b7280;
  text-align: right;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
`;

const DeleteButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #fee2e2;
    border-color: #fecaca;
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

const ConfirmButton = styled.button`
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

const TypeBadge = styled.div<{ $type: TransactionType }>`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.$type === 'income' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.$type === 'income' ? '#059669' : '#dc2626'};
`;

interface Transaction {
  amount: number;
  date: string;
  remainingBalance: number;
  jenre: string;
  type?: TransactionType;
  note?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  deleteTransactionByIndex: (index: number) => void;
}

const TransactionHistoryUpdated: React.FC<TransactionHistoryProps> = ({
  transactions,
  deleteTransactionByIndex,
}) => {
  const { user } = useAuth();
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    if (!user) return;
    const userCategories = await categoryService.getUserCategories(user.uid);
    setCategories(userCategories);
  };

  const getCategoryConfig = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category) {
      return {
        icon: category.icon,
        color: category.color,
        bgColor: `${category.color}20`
      };
    }
    // デフォルトカテゴリー設定
    return {
      icon: "📦",
      color: "#6b7280",
      bgColor: "#f9fafb"
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container>
      <Title>取引履歴</Title>
      
      {transactions.length === 0 ? (
        <EmptyMessage>取引記録はまだありません</EmptyMessage>
      ) : (
        <TransactionList>
          {transactions.map((transaction, index) => {
            const config = getCategoryConfig(transaction.jenre);
            const isIncome = transaction.type === 'income';
            
            return (
              <TransactionItem key={index}>
                <TransactionLeft>
                  <GenreIcon $bgColor={config.bgColor} $color={config.color}>
                    {config.icon}
                  </GenreIcon>
                  <TransactionInfo>
                    <TransactionAmount $isIncome={isIncome}>
                      {isIncome ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                    </TransactionAmount>
                    <TransactionDetails>
                      <TransactionGenre>{transaction.jenre}</TransactionGenre>
                      <TypeBadge $type={transaction.type || 'expense'}>
                        {isIncome ? '収入' : '支出'}
                      </TypeBadge>
                      {transaction.note && (
                        <TransactionNote>• {transaction.note}</TransactionNote>
                      )}
                    </TransactionDetails>
                  </TransactionInfo>
                </TransactionLeft>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <TransactionDate>
                    {formatDate(transaction.date)}
                  </TransactionDate>
                  
                  <ActionButtons>
                    {deleteConfirmIndex === index ? (
                      <ConfirmButtons>
                        <ConfirmButton
                          onClick={() => {
                            deleteTransactionByIndex(index);
                            setDeleteConfirmIndex(null);
                          }}
                        >
                          削除
                        </ConfirmButton>
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
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </DeleteButton>
                    )}
                  </ActionButtons>
                </div>
              </TransactionItem>
            );
          })}
        </TransactionList>
      )}
    </Container>
  );
};

export default TransactionHistoryUpdated;