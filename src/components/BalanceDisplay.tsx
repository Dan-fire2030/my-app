import styled from 'styled-components';

const Container = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  border: 2px solid #FFD700;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #FFD700;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: ${props => props.highlight ? 
    (props.negative ? 'linear-gradient(135deg, #2a1a1a, #3a1a1a)' : 'linear-gradient(135deg, #1a2a1a, #1a3a1a)') : 
    'linear-gradient(135deg, #2a2a2a, #1f1f1f)'};
  border-radius: 8px;
  border: 1px solid ${props => props.highlight ? 
    (props.negative ? '#ef4444' : '#10b981') : '#333333'};
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
  }
`;

const Label = styled.span`
  color: #cccccc;
  font-size: 16px;
  font-weight: 500;
`;

const Value = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.negative ? '#ef4444' : props.positive ? '#10b981' : '#ffffff'};
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const ProgressSection = styled.div`
  margin-top: 20px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ProgressLabel = styled.span`
  font-size: 14px;
  color: #cccccc;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  border: 1px solid #333333;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => 
    props.percentage > 90 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
    props.percentage > 70 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #059669)'
  };
  width: ${props => Math.min(props.percentage, 100)}%;
  transition: width 0.5s ease-out, background 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

const BalanceDisplay = ({ monthlyBudget, currentBalance }) => {
  const spentAmount = monthlyBudget - currentBalance;
  const spentPercentage = monthlyBudget > 0 ? (spentAmount / monthlyBudget) * 100 : 0;

  return (
    <Container>
      <Title>現在の状況</Title>
      
      <InfoGrid>
        <InfoRow>
          <Label>設定予算</Label>
          <Value>¥{monthlyBudget.toLocaleString()}</Value>
        </InfoRow>
        
        <InfoRow>
          <Label>使用金額</Label>
          <Value negative>¥{spentAmount.toLocaleString()}</Value>
        </InfoRow>
        
        <InfoRow highlight negative={currentBalance < 0}>
          <Label>残り金額</Label>
          <Value negative={currentBalance < 0} positive={currentBalance >= 0}>
            ¥{currentBalance.toLocaleString()}
          </Value>
        </InfoRow>
      </InfoGrid>

      {monthlyBudget > 0 && (
        <ProgressSection>
          <ProgressHeader>
            <ProgressLabel>使用率</ProgressLabel>
            <ProgressLabel>{Math.round(spentPercentage)}%</ProgressLabel>
          </ProgressHeader>
          <ProgressBar>
            <ProgressFill percentage={spentPercentage} />
          </ProgressBar>
        </ProgressSection>
      )}
    </Container>
  );
};

export default BalanceDisplay;