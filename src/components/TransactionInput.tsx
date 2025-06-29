import { useState, useEffect } from "react";
import styled from "styled-components";
import { categoryService } from '../services/categoryService';
import { Category, TransactionType } from '../utils/types';
import { useAuth } from '../contexts/FirebaseAuthContext';

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

const TypeSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const TypeButton = styled.button<{ $active: boolean; $type: TransactionType }>`
  padding: 12px;
  border: 2px solid ${props => props.$active ? (props.$type === 'expense' ? '#ef4444' : '#10b981') : '#666666'};
  background: ${props => props.$active ? 
    (props.$type === 'expense' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)') : 
    'linear-gradient(135deg, #2a2a2a, #1f1f1f)'};
  color: ${props => props.$active ? '#ffffff' : '#cccccc'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$type === 'expense' ? 
      'linear-gradient(135deg, #ef4444, #dc2626)' : 
      'linear-gradient(135deg, #10b981, #059669)'};
    border-color: ${props => props.$type === 'expense' ? '#ef4444' : '#10b981'};
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
  border: 2px solid ${props => props.$selected ? props.$borderColor : '#333333'};
  border-radius: 12px;
  background: ${props => props.$selected ? 
    `linear-gradient(135deg, ${props.$borderColor}30, ${props.$borderColor}10)` : 
    'linear-gradient(135deg, #2a2a2a, #1f1f1f)'};
  cursor: pointer;
  transition: all 0.2s ease;
  transform: ${props => props.$selected ? 'scale(1.02)' : 'scale(1)'};
  
  &:hover {
    border-color: ${props => props.$selected ? props.$borderColor : '#FFD700'};
    background: ${props => props.$selected ? 
      `linear-gradient(135deg, ${props.$borderColor}40, ${props.$borderColor}20)` : 
      'linear-gradient(135deg, #333333, #2a2a2a)'};
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
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
  font-weight: 600;
  color: ${props => props.$selected ? props.$color : '#cccccc'};
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

const NoteInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #666666;
  border-radius: 8px;
  font-size: 14px;
  background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  color: #ffffff;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FFD700;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
  }
  
  &::placeholder {
    color: #888888;
  }
`;

const SubmitButton = styled.button<{ $type: TransactionType }>`
  padding: 12px 32px;
  background: ${props => props.$type === 'expense' ? 
    'linear-gradient(135deg, #ef4444, #dc2626)' : 
    'linear-gradient(135deg, #10b981, #059669)'};
  color: white;
  font-weight: 700;
  border: 2px solid ${props => props.$type === 'expense' ? '#ef4444' : '#10b981'};
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
    background: ${props => props.$type === 'expense' ? 
      'linear-gradient(135deg, #dc2626, #b91c1c)' : 
      'linear-gradient(135deg, #059669, #047857)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #666666, #555555);
    border-color: #666666;
    cursor: not-allowed;
    color: #999999;
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

  // key prop が変わると自動的にコンポーネントが再マウントされる

  const loadCategories = async () => {
    if (!user) return;
    
    try {
      console.log('TransactionInput: Loading categories for user:', user.uid);
      await categoryService.initializeDefaultCategories(user.uid);
      const userCategories = await categoryService.getUserCategories(user.uid);
      setCategories(userCategories);
      console.log('TransactionInput: Categories loaded:', userCategories.length);
    } catch (error) {
      console.error('TransactionInput: Failed to load categories:', error);
      // フォールバック: デフォルトカテゴリーのみ表示
      setCategories([]);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === transactionType);

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