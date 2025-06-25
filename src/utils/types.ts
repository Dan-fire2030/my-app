export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  userId: string;
  isDefault: boolean;
  type: TransactionType;
  createdAt: Date;
}

export interface Transaction {
  amount: number;
  date: string;
  remainingBalance: number;
  jenre: string; // カテゴリー
  type: TransactionType;
  note?: string;
}

export interface Budget {
  id?: string;
  user_id?: string;
  amount: number;
  transactions: Transaction[];
  created_at?: string | { seconds: number; nanoseconds: number };
  updated_at?: string | { seconds: number; nanoseconds: number };
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'userId' | 'createdAt'>[] = [
  { name: '食費', icon: '🍽️', color: '#F97316', isDefault: true, type: 'expense' },
  { name: '交通費', icon: '🚃', color: '#3B82F6', isDefault: true, type: 'expense' },
  { name: '娯楽費', icon: '🎮', color: '#8B5CF6', isDefault: true, type: 'expense' },
  { name: 'その他', icon: '📦', color: '#6B7280', isDefault: true, type: 'expense' },
  { name: '給料', icon: '💰', color: '#10B981', isDefault: true, type: 'income' },
  { name: '臨時収入', icon: '🎁', color: '#EC4899', isDefault: true, type: 'income' },
  { name: '副収入', icon: '💼', color: '#06B6D4', isDefault: true, type: 'income' },
];