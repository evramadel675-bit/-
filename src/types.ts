export type TransactionType = 'expense' | 'income' | 'transfer';
export type AccountType = 'work' | 'personal';
export type CategoryType = 'work' | 'personal';
export type FilterType = 'all' | 'work' | 'personal';
export type ActiveTab = 'dashboard' | 'transactions' | 'notes' | 'reports' | 'settings';

export type NoteCategory = 'general' | 'work' | 'personal' | 'reminder';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  date: string;
  timestamp: number;
  color?: string;
  isPinned?: boolean;
  reminderDate?: string;
  updatedAt?: string;
}

export interface Transaction {
  id?: number;
  uuid?: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: CategoryType | string;
  sourceAccount: AccountType;
  targetAccount?: AccountType | null;
  date: string;
  timestamp: number;
  createdAt?: string;
  updatedAt?: string;
  is_synced?: number;
}

export interface AppSetting {
  key: string;
  value: any;
}

export interface Balances {
  work: number;
  personal: number;
  total: number;
}

export interface ExpenseBreakdown {
  workExpenses: number;
  personalExpenses: number;
  workIncome: number;
  personalIncome: number;
  workTransfersIn: number;
  workTransfersOut: number;
  personalTransfersIn: number;
  personalTransfersOut: number;
}
