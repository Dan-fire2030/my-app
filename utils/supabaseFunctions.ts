import { supabase } from "./supabase";

type Transaction = {
  amount: number;
  date: string;
  remainingBalance: number;
  jenre: string;
};

type Budget = {
  id?: string;
  user_id?: string;
  amount: number;
  transactions: Transaction[];
  created_at?: string;
};

export const getAllData = async (table: string) => {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    // エラーは内部で処理"Error fetching data:", error);
    return { data: [], error };
  }
  return { data, error };
};

export const addData = async (table: string, newData: any) => {
  const { data, error } = await supabase.from(table).insert(newData);

  if (error) {
    // エラーは内部で処理
    return null;
  }

  return { data, error };
};

// 最新の予算を取得（ユーザー別）
export const getLatestBudget = async () => {
  try {
    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from("budget_book")
      .select("*")
      .eq('user_id', user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    // エラーは内部で処理"Error fetching latest budget:", error);
    return { data: null, error };
  }
};

// 新しい予算を作成（ユーザー別）
export const createNewBudget = async (budget: Budget) => {
  try {
    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // user_idを追加してbudgetを作成
    const budgetWithUserId = {
      amount: budget.amount,
      transactions: budget.transactions || [],
      user_id: user.id
    };

    const { data, error } = await supabase
      .from("budget_book")
      .insert([budgetWithUserId])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// 予算のトランザクションを更新（ユーザー認証付き）
export const updateBudgetTransactions = async (
  budgetId: string,
  transactions: Transaction[]
) => {
  try {
    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from("budget_book")
      .update({ transactions })
      .eq("id", budgetId)
      .eq("user_id", user.id) // ユーザーの所有する予算のみ更新可能
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    // エラーは内部で処理"Error updating transactions:", error);
    return { data: null, error };
  }
};

// 予算履歴を取得（ユーザー別）
export const getBudgetHistory = async () => {
  try {
    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from("budget_book")
      .select("*")
      .eq('user_id', user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      data: data.map((budget) => ({
        budget: budget.amount,
        transactions: budget.transactions || [],
      })),
      error: null,
    };
  } catch (error) {
    // エラーは内部で処理"Error fetching budget history:", error);
    return { data: [], error };
  }
};

// export const deleteTransactionByIndex = async (
//   budgetId: string,
//   transactionIndex: number
// ) => {
//   try {
//     // 1. 該当するレコードを取得
//     const { data: budget, error: fetchError } = await supabase
//       .from("budget_book")
//       .select("transactions")
//       .eq("id", budgetId)
//       .single();

//     if (fetchError) {
//       // エラーは内部で処理"Error fetching budget:", fetchError);
//       return { success: false, error: fetchError };
//     }

//     // 2. 配列から指定されたインデックス番号の要素を削除
//     const updatedTransactions = budget.transactions.filter(
//       (_: any, index: number) => index !== transactionIndex
//     );

//     // 3. 更新された配列を保存
//     const { error: updateError } = await supabase
//       .from("budget_book")
//       .update({ transactions: updatedTransactions })
//       .eq("id", budgetId);

//     if (updateError) {
//       // エラーは内部で処理"Error updating transactions:", updateError);
//       return { success: false, error: updateError };
//     }

//     return { success: true, error: null };
//   } catch (error) {
//     // エラーは内部で処理"Unexpected error:", error);
//     return { success: false, error };
//   }
// };
