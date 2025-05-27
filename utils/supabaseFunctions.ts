import { supabase } from "./supabase";

type Transaction = {
  amount: number;
  date: string;
  remainingBalance: number;
};

type Budget = {
  id?: string;
  amount: number;
  transactions: Transaction[];
  created_at?: string;
};

export const getAllData = async (table: string) => {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.error("Error fetching data:", error);
    return { data: [], error };
  }
  return { data, error };
};

export const addData = async (table: string, newData: any) => {
  const { data, error } = await supabase.from(table).insert(newData);

  if (error) {
    console.error(
      "Error adding data:",
      error.message,
      error.details,
      error.hint
    );
    return null;
  }

  return { data, error };
};

// 最新の予算を取得
export const getLatestBudget = async () => {
  try {
    const { data, error } = await supabase
      .from("budget_book")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // single() から maybeSingle() に変更

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching latest budget:", error);
    return { data: null, error };
  }
};

// 新しい予算を作成
export const createNewBudget = async (budget: Budget) => {
  try {
    const { data, error } = await supabase
      .from("budget_book")
      .insert(budget)
      .select()
      .maybeSingle(); // single() から maybeSingle() に変更

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error creating budget:", error);
    return { data: null, error };
  }
};

// 予算のトランザクションを更新
export const updateBudgetTransactions = async (
  budgetId: string,
  transactions: Transaction[]
) => {
  const { data, error } = await supabase
    .from("budget_book")
    .update({ transactions })
    .eq("id", budgetId)
    .select()
    .single();

  if (error) {
    console.error("Error updating transactions:", error);
    return { data: null, error };
  }
  return { data, error };
};

// 予算履歴を取得
export const getBudgetHistory = async () => {
  try {
    const { data, error } = await supabase
      .from("budget_book")
      .select("*")
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
    console.error("Error fetching budget history:", error);
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
//       console.error("Error fetching budget:", fetchError);
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
//       console.error("Error updating transactions:", updateError);
//       return { success: false, error: updateError };
//     }

//     return { success: true, error: null };
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return { success: false, error };
//   }
// };
