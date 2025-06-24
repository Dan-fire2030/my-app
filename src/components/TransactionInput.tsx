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

const TypeSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const TypeButton = styled.button<{ $active: boolean; $type: TransactionType }>`
  padding: 12px;
  border: 2px solid ${props => props.$active ? (props.$type === 'expense' ? '#ef4444' : '#10b981') : '#e5e7eb'};
  background: ${props => props.$active ? (props.$type === 'expense' ? '#fee2e2' : '#d1fae5') : 'white'};
  color: ${props => props.$active ? (props.$type === 'expense' ? '#dc2626' : '#059669') : '#6b7280'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$type === 'expense' ? '#fee2e2' : '#d1fae5'};
    border-color: ${props => props.$type === 'expense' ? '#ef4444' : '#10b981'};
    color: ${props => props.$type === 'expense' ? '#dc2626' : '#059669'};
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
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
`;

const GenreLabel = styled.label<{ $selected: boolean; $borderColor: string; $bgColor: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px solid ${props => props.$selected ? props.$borderColor : '#e5e7eb'};
  border-radius: 12px;
  background-color: ${props => props.$selected ? props.$bgColor : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  transform: ${props => props.$selected ? 'scale(1.02)' : 'scale(1)'};
  
  &:hover {
    border-color: ${props => props.$selected ? props.$borderColor : '#d1d5db'};
    background-color: ${props => props.$selected ? props.$bgColor : '#f9fafb'};
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

const GenreName = styled.span<{ $selected: boolean; $color: string }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$selected ? props.$color : '#374151'};
`;

const CheckIcon = styled.div<{ $color: string }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background-color: ${props => props.$color};
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

const NoteInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SubmitButton = styled.button<{ $type: TransactionType }>`
  padding: 12px 32px;
  background-color: ${props => props.$type === 'expense' ? '#ef4444' : '#10b981'};
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
    background-color: ${props => props.$type === 'expense' ? '#dc2626' : '#059669'};
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

interface TransactionInputProps {
  expenseAmount: string;
  switchingButton: boolean;
  setExpenseAmount: (amount: string) => void;
  setSwitchingButton: (value: boolean | ((prev: boolean) => boolean)) => void;
  handleAddExpense: (e: React.FormEvent, type: TransactionType, note?: string) => void;
  selectedRadioButton: string;
  selectedJenres: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isModal?: boolean;
}

const TransactionInput: React.FC<TransactionInputProps> = ({
  expenseAmount,
  switchingButton,
  setExpenseAmount,
  setSwitchingButton,
  handleAddExpense,
  selectedRadioButton,
  selectedJenres,
  isModal = false,
}) => {
  const { user } = useAuth();
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    if (!user) return;
    await categoryService.initializeDefaultCategories(user.uid);
    const userCategories = await categoryService.getUserCategories(user.uid);
    setCategories(userCategories);
  };

  const filteredCategories = categories.filter(cat => {
    if (transactionType === 'expense') {
      return !['給料', '臨時収入', '副収入'].includes(cat.name);
    } else {
      return ['給料', '臨時収入', '副収入', 'その他'].includes(cat.name);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddExpense(e, transactionType, note);
    setNote('');
  };

  const getColorWithOpacity = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <Container>
      {!isModal && (
        <ToggleButton onClick={() => setSwitchingButton((prev) => !prev)}>
          {switchingButton ? "入力フォームを閉じる" : "収支を記録する"}
        </ToggleButton>
      )}

      {(switchingButton || isModal) && (
        <FormContainer>
          {/* 収支タイプ選択 */}
          <TypeSelector>
            <TypeButton
              $active={transactionType === 'expense'}
              $type="expense"
              onClick={() => setTransactionType('expense')}
            >
              支出
            </TypeButton>
            <TypeButton
              $active={transactionType === 'income'}
              $type="income"
              onClick={() => setTransactionType('income')}
            >
              収入
            </TypeButton>
          </TypeSelector>

          {/* カテゴリー選択 */}
          <div>
            <SectionTitle>カテゴリーを選択</SectionTitle>
            <GenreGrid>
              {filteredCategories.map((category) => (
                <GenreLabel
                  key={category.id}
                  $selected={selectedRadioButton === category.name}
                  $bgColor={getColorWithOpacity(category.color, 0.1)}
                  $borderColor={category.color}
                >
                  <GenreRadio
                    type="radio"
                    id={category.id}
                    value={category.name}
                    checked={selectedRadioButton === category.name}
                    onChange={selectedJenres}
                  />
                  <GenreIcon>{category.icon}</GenreIcon>
                  <GenreName
                    $selected={selectedRadioButton === category.name}
                    $color={category.color}
                  >
                    {category.name}
                  </GenreName>
                  {selectedRadioButton === category.name && (
                    <CheckIcon $color={category.color}>
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
                onClick={handleSubmit}
                disabled={!expenseAmount || expenseAmount <= 0}
                $type={transactionType}
              >
                記録する
              </SubmitButton>
            </InputGroup>
          </AmountSection>

          {/* メモ入力 */}
          <div>
            <SectionTitle>メモ（任意）</SectionTitle>
            <NoteInput
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例: ランチ代、電車賃など"
              maxLength={50}
            />
          </div>

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

export default TransactionInput;