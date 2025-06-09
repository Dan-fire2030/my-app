import styled from "styled-components";

const RemainingAmountMeter = ({ currentBalance, monthlyBudget, onAddExpense, showExpenseForm }) => {
  const remainingPercentage = monthlyBudget > 0 ? Math.max((currentBalance / monthlyBudget) * 100, 0) : 0;
  const usedPercentage = 100 - remainingPercentage;

  const getStatusColor = () => {
    if (currentBalance < 0) return "#ef4444";
    if (remainingPercentage < 20) return "#f59e0b";
    return "#10b981";
  };

  const Container = styled.div`
    position: relative;
    background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
    border-radius: 16px;
    padding: 32px 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.8);
    margin-bottom: 24px;
  `;

  const Title = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    text-align: center;
    margin-bottom: 24px;
  `;

  const MeterWrapper = styled.div`
    position: relative;
    width: 256px;
    height: 256px;
    margin: 0 auto;
  `;

  const CircleContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const CircleSVG = styled.svg`
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  `;

  const CircleBackground = styled.circle`
    fill: none;
    stroke: #e5e7eb;
    stroke-width: 20;
  `;

  const CircleProgress = styled.circle`
    fill: none;
    stroke: ${getStatusColor()};
    stroke-width: 20;
    stroke-linecap: round;
    stroke-dasharray: 628.3;
    stroke-dashoffset: ${628.3 - (usedPercentage / 100) * 628.3};
    transition: stroke-dashoffset 1s ease-out;
  `;

  const CenterContent = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  `;

  const PercentageText = styled.div`
    font-size: 32px;
    font-weight: bold;
    color: ${getStatusColor()};
    margin-bottom: 4px;
  `;

  const LabelText = styled.div`
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 8px;
  `;

  const AmountText = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8px;
  `;

  const StatusBadge = styled.div`
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    background-color: ${getStatusColor()}20;
    color: ${getStatusColor()};
    margin-top: 8px;
  `;

  const Legend = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    margin-top: 24px;
  `;

  const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  const LegendDot = styled.div`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.color};
  `;

  const LegendLabel = styled.span`
    font-size: 14px;
    color: #6b7280;
  `;

  // オシャレなトグルボタン（プラス/マイナス）
  const AddExpenseButton = styled.button`
    position: absolute;
    top: 24px;
    right: 24px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, 
      ${showExpenseForm ? '#ef4444 0%, #dc2626 100%' : '#10b981 0%, #059669 100%'});
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px ${showExpenseForm ? 
      'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'};
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px ${showExpenseForm ? 
        'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'};
    }
    
    &:active {
      transform: translateY(-1px) scale(1.02);
    }
    
    @media (max-width: 640px) {
      width: 40px;
      height: 40px;
      top: 20px;
      right: 20px;
    }
  `;

  const ToggleIcon = styled.svg`
    width: 20px;
    height: 20px;
    color: white;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: rotate(180deg);
    }
    
    @media (max-width: 640px) {
      width: 16px;
      height: 16px;
    }
  `;

  const getStatusText = () => {
    if (currentBalance < 0) return "予算超過";
    if (remainingPercentage < 20) return "残りわずか";
    return "良好";
  };

  return (
    <Container>
      <AddExpenseButton onClick={onAddExpense}>
        <ToggleIcon 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {showExpenseForm ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          )}
        </ToggleIcon>
      </AddExpenseButton>
      
      <Title>予算の残量</Title>
      
      <MeterWrapper>
        <CircleContainer>
          <CircleSVG viewBox="0 0 256 256">
            <CircleBackground
              cx="128"
              cy="128"
              r="100"
            />
            <CircleProgress
              cx="128"
              cy="128"
              r="100"
            />
          </CircleSVG>
          
          <CenterContent>
            <PercentageText>{remainingPercentage.toFixed(0)}%</PercentageText>
            <LabelText>残り</LabelText>
            <AmountText>¥{currentBalance.toLocaleString()}</AmountText>
            <StatusBadge>{getStatusText()}</StatusBadge>
          </CenterContent>
        </CircleContainer>
      </MeterWrapper>

      <Legend>
        <LegendItem>
          <LegendDot color={getStatusColor()} />
          <LegendLabel>使用済み</LegendLabel>
        </LegendItem>
        <LegendItem>
          <LegendDot color="#e5e7eb" />
          <LegendLabel>残り</LegendLabel>
        </LegendItem>
      </Legend>
    </Container>
  );
};

export default RemainingAmountMeter;