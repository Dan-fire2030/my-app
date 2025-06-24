import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { categoryService } from '../services/categoryService';
import { Category } from '../utils/types';
import { useAuth } from '../contexts/FirebaseAuthContext';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
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
  background: ${props => props.$color}20;
  border: 2px solid ${props => props.$color};
  border-radius: 20px;
  font-size: 14px;
  position: relative;
  
  ${props => !props.$isDefault && `
    padding-right: 36px;
    
    &:hover button {
      opacity: 1;
    }
  `}
`;

const CategoryIcon = styled.span`
  font-size: 18px;
`;

const CategoryName = styled.span`
  font-weight: 500;
  color: #333;
`;

const DeleteButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  padding: 4px;
  
  &:hover {
    color: #dc2626;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
    color: #4b5563;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #4b5563;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const EmojiPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
`;

const EmojiButton = styled.button<{ $selected: boolean }>`
  padding: 8px;
  border: 1px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  background: ${props => props.$selected ? '#eff6ff' : 'white'};
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
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
  background: ${props => props.$color};
  border: 2px solid ${props => props.$selected ? '#1f2937' : props.$color};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const EMOJI_OPTIONS = [
  '🍕', '🍱', '☕', '🛒', '🚗', '🚇', '✈️', '🏠',
  '💊', '🏥', '👕', '👟', '📚', '🎬', '🎪', '🏋️',
  '💡', '📱', '💻', '🎁', '💐', '🐕', '✂️', '🔧'
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
    color: '#3B82F6'
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
      setNewCategory({ name: '', icon: '📦', color: '#3B82F6' });
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
      <Title>カテゴリー管理</Title>
      <CategoryList>
        {categories.map(category => (
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
        <AddButton onClick={() => setIsModalOpen(true)}>
          <FaPlus size={12} />
          <span>新規追加</span>
        </AddButton>
      </CategoryList>

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
                {EMOJI_OPTIONS.map(emoji => (
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