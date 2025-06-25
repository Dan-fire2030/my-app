import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  border: 2px solid #FFD700;
`;

const ToggleButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000000;
  font-weight: 700;
  padding: 18px 24px;
  border-radius: 12px;
  border: 2px solid #FFD700;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(255, 215, 0, 0.6);
    background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FormContainer = styled.div`
  margin-top: 24px;
  display: grid;
  gap: 20px;
  animation: slideDown 0.3s ease-out;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #FFD700;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const GenreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const GenreLabel = styled.label`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px solid ${props => props.selected ? props.borderColor : '#333333'};
  border-radius: 12px;
  background: ${props => props.selected ? 
    `linear-gradient(135deg, ${props.borderColor}30, ${props.borderColor}10)` : 
    'linear-gradient(135deg, #2a2a2a, #1f1f1f)'};
  cursor: pointer;
  transition: all 0.2s ease;
  transform: ${props => props.selected ? 'scale(1.02)' : 'scale(1)'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    border-color: ${props => props.selected ? props.borderColor : '#FFD700'};
    background: ${props => props.selected ? 
      `linear-gradient(135deg, ${props.borderColor}40, ${props.borderColor}20)` : 
      'linear-gradient(135deg, #333333, #2a2a2a)'};
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
  }
`;

const GenreRadio = styled.input`
  position: absolute;
  opacity: 0;
`;

const GenreIcon = styled.span`
  font-size: 32px;
  margin-bottom: 8px;
`;

const GenreName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.selected ? props.color : '#cccccc'};
  text-shadow: ${props => props.selected ? '1px 1px 2px rgba(0, 0, 0, 0.5)' : 'none'};
`;

const CheckIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background-color: ${props => props.color};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 12px;
    height: 12px;
    color: white;
  }
`;

const AmountSection = styled.div`
  display: grid;
  gap: 12px;
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

const AmountInput = styled.input`
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
`;

const SubmitButton = styled.button`
  padding: 12px 32px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 700;
  border: 2px solid #10b981;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  flex-shrink: 0;
  box-sizing: border-box;
  
  @media (min-width: 768px) {
    width: auto;
    min-width: 120px;
  }
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #666666, #555555);
    border-color: #666666;
    color: #999999;
    cursor: not-allowed;
  }
`;

const QuickAmountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const QuickAmountButton = styled.button`
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
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  }
`;

const ExpenseInput = ({
  expenseAmount,
  switchingButton,
  setExpenseAmount,
  setSwitchingButton,
  handleAddExpense,
  selectedRadioButton,
  selectedJenres,
  isModal = false,
}) => {
  const RADIO_COLLECTION = {
    food: { 
      label: "食費", 
      icon: "🍽️", 
      bgColor: "#fff7ed",
      borderColor: "#fb923c",
      color: "#ea580c"
    },
    transportation: { 
      label: "交通費", 
      icon: "🚃", 
      bgColor: "#eff6ff",
      borderColor: "#60a5fa",
      color: "#2563eb"
    },
    entertainment: { 
      label: "娯楽費", 
      icon: "🎮", 
      bgColor: "#f3e8ff",
      borderColor: "#a78bfa",
      color: "#7c3aed"
    },
    other: { 
      label: "その他", 
      icon: "📦", 
      bgColor: "#f9fafb",
      borderColor: "#9ca3af",
      color: "#4b5563"
    },
  };

  return (
    <Container>
      {!isModal && (
        <ToggleButton onClick={() => setSwitchingButton((prev) => !prev)}>
          {switchingButton ? "入力フォームを閉じる" : "支出を入力する"}
        </ToggleButton>
      )}

      {(switchingButton || isModal) && (
        <FormContainer>
          {/* ジャンル選択 */}
          <div>
            <SectionTitle>カテゴリーを選択</SectionTitle>
            <GenreGrid>
              {Object.entries(RADIO_COLLECTION).map(([key, config]) => (
                <GenreLabel
                  key={key}
                  selected={selectedRadioButton === config.label}
                  bgColor={config.bgColor}
                  borderColor={config.borderColor}
                >
                  <GenreRadio
                    type="radio"
                    id={key}
                    value={config.label}
                    checked={selectedRadioButton === config.label}
                    onChange={selectedJenres}
                  />
                  <GenreIcon>{config.icon}</GenreIcon>
                  <GenreName
                    selected={selectedRadioButton === config.label}
                    color={config.color}
                  >
                    {config.label}
                  </GenreName>
                  {selectedRadioButton === config.label && (
                    <CheckIcon color={config.borderColor}>
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </CheckIcon>
                  )}
                </GenreLabel>
              ))}
            </GenreGrid>
          </div>

          {/* 金額入力 */}
          <AmountSection>
            <SectionTitle>金額を入力</SectionTitle>
            <InputGroup>
              <InputWrapper>
                <CurrencySymbol>¥</CurrencySymbol>
                <AmountInput
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0"
                />
              </InputWrapper>
              <SubmitButton
                onClick={(e) => handleAddExpense(e)}
                disabled={!expenseAmount || expenseAmount <= 0}
              >
                記録する
              </SubmitButton>
            </InputGroup>
          </AmountSection>

          {/* クイック入力ボタン */}
          <div>
            <SectionTitle>クイック入力</SectionTitle>
            <QuickAmountGrid>
              {[100, 500, 1000, 3000].map((amount) => (
                <QuickAmountButton
                  key={amount}
                  onClick={() => {
                    const currentValue = parseFloat(expenseAmount) || 0;
                    setExpenseAmount((currentValue + amount).toString());
                  }}
                >
                  +¥{amount.toLocaleString()}
                </QuickAmountButton>
              ))}
            </QuickAmountGrid>
          </div>
        </FormContainer>
      )}
    </Container>
  );
};

export default ExpenseInput;