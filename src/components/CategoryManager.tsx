import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { categoryService } from '../services/categoryService';
import { Category, TransactionType } from '../utils/types';
import { useAuth } from '../contexts/FirebaseAuthContext';

const Container = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  border: 2px solid #FFD700;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #FFD700;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
`;

const CategoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const CategoryItem = styled.div<{ $color: string; $isDefault: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, ${props => props.$color}30, ${props => props.$color}10);
  border: 2px solid ${props => props.$color};
  border-radius: 20px;
  font-size: 14px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  ${props => !props.$isDefault && `
    padding-right: 36px;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transform: translateY(-1px);
    }
    
    &:hover button {
      opacity: 1;
    }
  `}
`;

const CategoryIcon = styled.span`
  font-size: 18px;
`;

const CategoryName = styled.span`
  font-weight: 600;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const DeleteButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  border: 1px solid #ef4444;
  border-radius: 50%;
  color: #ef4444;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  padding: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: none;
  border-radius: 24px;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
    box-shadow: 0 6px 16px rgba(255, 215, 0, 0.5);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  border: 2px solid #FFD700;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #FFD700;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  border: 1px solid #FFD700;
  border-radius: 50%;
  color: #FFD700;
  cursor: pointer;
  padding: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #000000;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #FFD700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #666666;
  border-radius: 8px;
  font-size: 14px;
  background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
  color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #FFD700;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
  }
  
  &::placeholder {
    color: #888888;
  }
`;

const EmojiPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(5, 1fr);
  }
  
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
    
    &:hover {
      background: #9ca3af;
    }
  }
`;

const EmojiButton = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: 2px solid ${props => props.$selected ? '#FFD700' : '#666666'};
  background: ${props => props.$selected ? 
    'linear-gradient(135deg, #FFD700, #FFA500)' : 
    'linear-gradient(135deg, #2a2a2a, #1f1f1f)'};
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #FFD700;
    background: linear-gradient(135deg, #FFD700, #FFA500);
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  }
`;

const ColorPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
`;

const ColorButton = styled.button<{ $color: string; $selected: boolean }>`
  width: 100%;
  height: 32px;
  background: linear-gradient(135deg, ${props => props.$color}, ${props => props.$color}CC);
  border: 2px solid ${props => props.$selected ? '#FFD700' : props.$color};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000000;
  border: 2px solid #FFD700;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: linear-gradient(135deg, #FFA500, #FF8C00);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #666666, #555555);
    border-color: #666666;
    color: #999999;
    cursor: not-allowed;
  }
`;

const TypeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const TypeButton = styled.button<{ $selected: boolean }>`
  flex: 1;
  padding: 8px;
  border: 2px solid ${props => props.$selected ? '#FFD700' : '#666666'};
  background: ${props => props.$selected ? 
    'linear-gradient(135deg, #FFD700, #FFA500)' : 
    'linear-gradient(135deg, #2a2a2a, #1f1f1f)'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$selected ? '#000000' : '#cccccc'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #FFD700;
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #000000;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  }
`;

const EXPENSE_EMOJI_OPTIONS = [
  '🍕', '🍱', '☕', '🛒', '🚗', '🚇', '✈️', '🏠',
  '💊', '🏥', '👕', '👟', '📚', '🎬', '🎪', '🏋️',
  '💡', '📱', '💻', '🎁', '💐', '🐕', '✂️', '🔧'
];

const INCOME_EMOJI_OPTIONS = [
  '💰', '💵', '💴', '💶', '💷', '💸', '🏦', '💳',
  '💎', '🎁', '🏆', '🎯', '📈', '💼', '🏢', '🏭',
  '🌟', '⭐', '✨', '🎉', '🎊', '🎈', '🏅', '🥇'
];

const COLOR_OPTIONS = [
  '#F97316', '#EF4444', '#EC4899', '#8B5CF6', 
  '#3B82F6', '#06B6D4', '#10B981', '#EAB308',
  '#78716C', '#F59E0B', '#84CC16', '#14B8A6'
];

interface CategoryManagerProps {
  onCategoryChange?: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ onCategoryChange }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📦',
    color: '#3B82F6',
    type: 'expense' as TransactionType
  });

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

  const handleCreateCategory = async () => {
    if (!user || !newCategory.name.trim()) return;
    
    const created = await categoryService.createCategory(user.uid, newCategory);
    if (created) {
      await loadCategories();
      setIsModalOpen(false);
      setNewCategory({ name: '', icon: '📦', color: '#3B82F6', type: 'expense' });
      onCategoryChange?.();
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('このカテゴリーを削除してもよろしいですか？')) {
      const success = await categoryService.deleteCategory(categoryId);
      if (success) {
        await loadCategories();
        onCategoryChange?.();
      }
    }
  };

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title>カテゴリー管理</Title>
        <AddButton onClick={() => setIsModalOpen(true)}>
          <FaPlus size={14} />
          <span>新規カテゴリー追加</span>
        </AddButton>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ fontSize: '14px', color: '#666' }}>支出カテゴリー</strong>
        </div>
        <CategoryList>
        {categories.filter(c => c.type === 'expense').map(category => (
          <CategoryItem 
            key={category.id} 
            $color={category.color}
            $isDefault={category.isDefault}
          >
            <CategoryIcon>{category.icon}</CategoryIcon>
            <CategoryName>{category.name}</CategoryName>
            {!category.isDefault && (
              <DeleteButton onClick={() => handleDeleteCategory(category.id)}>
                <FaTrash size={12} />
              </DeleteButton>
            )}
          </CategoryItem>
        ))}
      </CategoryList>
      </div>
      
      <div>
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ fontSize: '14px', color: '#666' }}>収入カテゴリー</strong>
        </div>
        <CategoryList>
          {categories.filter(c => c.type === 'income').map(category => (
            <CategoryItem 
              key={category.id} 
              $color={category.color}
              $isDefault={category.isDefault}
            >
              <CategoryIcon>{category.icon}</CategoryIcon>
              <CategoryName>{category.name}</CategoryName>
              {!category.isDefault && (
                <DeleteButton onClick={() => handleDeleteCategory(category.id)}>
                  <FaTrash size={12} />
                </DeleteButton>
              )}
            </CategoryItem>
          ))}
        </CategoryList>
      </div>

      {isModalOpen && (
        <Modal onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>新しいカテゴリー</ModalTitle>
              <CloseButton onClick={() => setIsModalOpen(false)}>
                <FaTimes size={18} />
              </CloseButton>
            </ModalHeader>
            
            <FormGroup>
              <Label>カテゴリータイプ</Label>
              <TypeSelector>
                <TypeButton
                  $selected={newCategory.type === 'expense'}
                  onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                >
                  支出
                </TypeButton>
                <TypeButton
                  $selected={newCategory.type === 'income'}
                  onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                >
                  収入
                </TypeButton>
              </TypeSelector>
            </FormGroup>
            
            <FormGroup>
              <Label>カテゴリー名</Label>
              <Input
                type="text"
                value={newCategory.name}
                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="例: 医療費"
                maxLength={10}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>アイコン</Label>
              <EmojiPicker>
                {(newCategory.type === 'expense' ? EXPENSE_EMOJI_OPTIONS : INCOME_EMOJI_OPTIONS).map(emoji => (
                  <EmojiButton
                    key={emoji}
                    $selected={newCategory.icon === emoji}
                    onClick={() => setNewCategory({ ...newCategory, icon: emoji })}
                  >
                    {emoji}
                  </EmojiButton>
                ))}
              </EmojiPicker>
            </FormGroup>
            
            <FormGroup>
              <Label>カラー</Label>
              <ColorPicker>
                {COLOR_OPTIONS.map(color => (
                  <ColorButton
                    key={color}
                    $color={color}
                    $selected={newCategory.color === color}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                  />
                ))}
              </ColorPicker>
            </FormGroup>
            
            <SubmitButton 
              onClick={handleCreateCategory}
              disabled={!newCategory.name.trim()}
            >
              作成
            </SubmitButton>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};