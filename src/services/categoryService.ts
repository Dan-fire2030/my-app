import { collection, doc, setDoc, getDocs, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Category, DEFAULT_CATEGORIES } from '../utils/types';

const CATEGORIES_COLLECTION = 'categories';

export const categoryService = {
  async initializeDefaultCategories(userId: string): Promise<void> {
    try {
      const categoriesRef = collection(db, CATEGORIES_COLLECTION);
      const q = query(categoriesRef, where('userId', '==', userId), where('isDefault', '==', true));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        const batch = DEFAULT_CATEGORIES.map(async (category) => {
          const categoryId = `${userId}_${category.name.toLowerCase().replace(/\s+/g, '_')}`;
          const categoryData: Category = {
            ...category,
            id: categoryId,
            userId,
            createdAt: new Date(),
          };
          await setDoc(doc(db, CATEGORIES_COLLECTION, categoryId), categoryData);
        });
        
        await Promise.all(batch);
      }
    } catch (error) {
      console.error('Error initializing default categories:', error);
    }
  },

  async getUserCategories(userId: string): Promise<Category[]> {
    try {
      const categoriesRef = collection(db, CATEGORIES_COLLECTION);
      const q = query(
        categoriesRef, 
        where('userId', '==', userId),
        orderBy('isDefault', 'desc'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as Category));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async createCategory(userId: string, categoryData: Omit<Category, 'id' | 'userId' | 'createdAt' | 'isDefault'>): Promise<Category | null> {
    try {
      const categoryId = `${userId}_${Date.now()}`;
      const newCategory: Category = {
        ...categoryData,
        id: categoryId,
        userId,
        isDefault: false,
        createdAt: new Date(),
      };
      
      await setDoc(doc(db, CATEGORIES_COLLECTION, categoryId), newCategory);
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  },
};