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

const InfoGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.highlight ? (props.negative ? '#fef2f2' : '#f0fdf4') : '#f9fafb'};
  border-radius: 8px;
  transition: background-color 0.3s ease;
`;

const Label = styled.span`
  color: #6b7280;
  font-size: 16px;
`;

const Value = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.negative ? '#ef4444' : props.positive ? '#10b981' : '#1f2937'};
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
  color: #6b7280;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => 
    props.percentage > 90 ? '#ef4444' : 
    props.percentage > 70 ? '#f59e0b' : '#10b981'
  };
  width: ${props => Math.min(props.percentage, 100)}%;
  transition: width 0.5s ease-out, background-color 0.3s ease;
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