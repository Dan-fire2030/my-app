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

const PresetSection = styled.div`
  margin-bottom: 20px;
`;

const SectionLabel = styled.p`
  font-size: 14px;
  color: #cccccc;
  margin-bottom: 12px;
  font-weight: 500;
`;

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const PresetButton = styled.button`
  padding: 10px;
  background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  color: #cccccc;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid #666666;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #000000;
    border-color: #FFD700;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    transform: translateY(-1px);
  }
`;

const InputSection = styled.div`
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  min-width: 0;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #FFD700;
  font-size: 16px;
  font-weight: 600;
`;

const BudgetInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 32px;
  border: 2px solid #666666;
  border-radius: 8px;
  font-size: 16px;
  background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  color: #ffffff;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #FFD700;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
  }
  
  &::placeholder {
    color: #888888;
  }
  
  &:disabled {
    outline: none;
    border-color: #3b82f6;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SetButton = styled.button`
  padding: 14px 32px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000000;
  font-weight: 700;
  border: 2px solid #FFD700;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  flex-shrink: 0;
  box-sizing: border-box;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.4);
  
  @media (min-width: 768px) {
    width: auto;
    min-width: 120px;
  }
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #666666, #555555);
    border-color: #666666;
    color: #999999;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const WarningBox = styled.div`
  background: linear-gradient(135deg, #2a2a1a, #1f1f0f);
  border: 1px solid #FFD700;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
  gap: 8px;
`;

const WarningIcon = styled.svg`
  width: 20px;
  height: 20px;
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 2px;
`;

const WarningText = styled.p`
  font-size: 14px;
  color: #92400e;
  line-height: 1.5;
`;

interface BudgetSettingProps {
  budgetInput: string;
  setBudgetInput: (value: string) => void;
  handleSetBudget: (e: React.FormEvent) => void;
}

const BudgetSetting: React.FC<BudgetSettingProps> = ({
  budgetInput,
  setBudgetInput,
  handleSetBudget,
}) => {
  const presetAmounts = [30000, 50000, 80000, 100000];

  return (
    <Container>
      <Title>月次予算設定</Title>
      
      <PresetSection>
        <SectionLabel>よく使われる金額</SectionLabel>
        <PresetGrid>
          {presetAmounts.map((amount) => (
            <PresetButton
              key={amount}
              onClick={() => {
                const currentValue = parseFloat(budgetInput) || 0;
                setBudgetInput((currentValue + amount).toString());
              }}
            >
              +¥{amount.toLocaleString()}
            </PresetButton>
          ))}
        </PresetGrid>
      </PresetSection>

      <InputSection>
        <InputGroup>
          <InputWrapper>
            <CurrencySymbol>¥</CurrencySymbol>
            <BudgetInput
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="0"
            />
          </InputWrapper>
          <SetButton
            onClick={handleSetBudget}
            disabled={!budgetInput || Number(budgetInput) <= 0}
          >
            設定する
          </SetButton>
        </InputGroup>
      </InputSection>

      <WarningBox>
        <WarningIcon fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </WarningIcon>
        <WarningText>
          新しい予算を設定すると、現在の取引履歴はリセットされます
        </WarningText>
      </WarningBox>
    </Container>
  );
};

export default BudgetSetting;