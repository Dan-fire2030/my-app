import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
`;

const ToggleButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 600;
  padding: 18px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.25);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(59, 130, 246, 0.35);
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
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 12px;
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
  border: 2px solid ${props => props.selected ? props.borderColor : '#e5e7eb'};
  border-radius: 12px;
  background-color: ${props => props.selected ? props.bgColor : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  transform: ${props => props.selected ? 'scale(1.02)' : 'scale(1)'};
  
  &:hover {
    border-color: ${props => props.selected ? props.borderColor : '#d1d5db'};
    background-color: ${props => props.selected ? props.bgColor : '#f9fafb'};
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
  font-weight: 500;
  color: ${props => props.selected ? props.color : '#374151'};
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
  color: #6b7280;
  font-size: 16px;
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 32px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 32px;
  background-color: #10b981;
  color: white;
  font-weight: 600;
  border: none;
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
    background-color: #059669;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: #d1d5db;
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
  background-color: #f3f4f6;
  color: #374151;
  font-weight: 500;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e5e7eb;
    transform: translateY(-1px);
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