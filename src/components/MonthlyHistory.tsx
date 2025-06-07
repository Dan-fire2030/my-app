import { useState } from 'react';
import styled from 'styled-components';

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

const HistoryList = styled.div`
  display: grid;
  gap: 16px;
`;

const HistoryItem = styled.div`
  border: 1px solid rgba(229, 231, 235, 0.6);
  border-radius: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const BudgetInfo = styled.div``;

const MonthLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
`;

const BudgetAmount = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const BudgetStats = styled.div`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
`;

const TransactionCount = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const SpentAmount = styled.span`
  color: #ef4444;
`;

const RemainingAmount = styled.span`
  color: ${props => props.negative ? '#ef4444' : '#10b981'};
  font-weight: 500;
`;

const TransactionSection = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
`;

const TransactionLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
`;

const TransactionGrid = styled.div`
  display: grid;
  gap: 4px;
`;

const TransactionMini = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding: 4px 0;
`;

const TransactionMiniLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
`;

const TransactionMiniRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TransactionMiniAmount = styled.span`
  font-weight: 500;
  color: #1f2937;
`;

const TransactionMiniDate = styled.span`
  color: #9ca3af;
  font-size: 13px;
`;

const MoreTransactions = styled.button`
  width: 100%;
  text-align: center;
  color: #3b82f6;
  background: none;
  border: none;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #eff6ff;
    color: #2563eb;
  }
`;

const MonthlyHistory = ({ monthlyHistory }) => {
  const [showAll, setShowAll] = useState({});
  
  const toggleShowAll = (index) => {
    setShowAll(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // 月の表示を生成する関数
  const getMonthLabel = (index) => {
    const now = new Date();
    const monthsAgo = index + 1;
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    
    return `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月`;
  };

  const genreConfig = {
    食費: { icon: "🍽️" },
    交通費: { icon: "🚃" },
    娯楽費: { icon: "🎮" },
    その他: { icon: "📦" },
  };

  return (
    <Container>
      <Title>月次履歴</Title>
      
      {monthlyHistory.length === 0 ? (
        <EmptyMessage>月次履歴はまだありません</EmptyMessage>
      ) : (
        <HistoryList>
          {monthlyHistory.map((history, index) => {
            const totalSpent = history.transactions.reduce((sum, t) => sum + t.amount, 0);
            const remaining = history.budget - totalSpent;
            
            return (
              <HistoryItem key={index}>
                <HistoryHeader>
                  <BudgetInfo>
                    <MonthLabel>{getMonthLabel(index)}</MonthLabel>
                    <BudgetAmount>
                      月次予算: ¥{history.budget.toLocaleString()}
                    </BudgetAmount>
                    <BudgetStats>
                      支出: <SpentAmount>¥{totalSpent.toLocaleString()}</SpentAmount> / 
                      残高: <RemainingAmount negative={remaining < 0}>
                        ¥{remaining.toLocaleString()}
                      </RemainingAmount>
                    </BudgetStats>
                  </BudgetInfo>
                  <TransactionCount>
                    {history.transactions.length}件の取引
                  </TransactionCount>
                </HistoryHeader>

                {history.transactions.length > 0 && (
                  <TransactionSection>
                    <TransactionLabel>取引明細:</TransactionLabel>
                    <TransactionGrid>
                      {(showAll[index] ? history.transactions : history.transactions.slice(0, 3)).map((transaction, transIndex) => {
                        const config = genreConfig[transaction.jenre] || genreConfig["その他"];
                        
                        return (
                          <TransactionMini key={transIndex}>
                            <TransactionMiniLeft>
                              <span>{config.icon}</span>
                              <span>{transaction.jenre}</span>
                            </TransactionMiniLeft>
                            <TransactionMiniRight>
                              <TransactionMiniAmount>
                                ¥{transaction.amount.toLocaleString()}
                              </TransactionMiniAmount>
                              <TransactionMiniDate>
                                ({transaction.date})
                              </TransactionMiniDate>
                            </TransactionMiniRight>
                          </TransactionMini>
                        );
                      })}
                    </TransactionGrid>
                    {history.transactions.length > 3 && (
                      <MoreTransactions onClick={() => toggleShowAll(index)}>
                        {showAll[index] 
                          ? '表示を折りたたむ' 
                          : `他 ${history.transactions.length - 3} 件を表示`
                        }
                      </MoreTransactions>
                    )}
                  </TransactionSection>
                )}
              </HistoryItem>
            );
          })}
        </HistoryList>
      )}
    </Container>
  );
};

export default MonthlyHistory;