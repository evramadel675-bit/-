import Dexie, { type Table } from 'dexie';
import type { Transaction, AppSetting, Balances, ExpenseBreakdown, Note, NoteCategory } from '../types';

const LS_TRANSACTIONS_KEY = 'cashflow_transactions';
const LS_SETTINGS_KEY = 'cashflow_settings';
const LS_NOTES_KEY = 'cashflow_notes';

// Dexie Database for backwards compatibility and dual offline storage
export class CashFlowDatabase extends Dexie {
  transactions!: Table<Transaction, number>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('CashFlowDB');

    this.version(1).stores({
      transactions: '++id, type, amount, description, category, sourceAccount, targetAccount, date, timestamp',
      settings: 'key, value'
    });

    this.version(2).stores({
      transactions: '++id, uuid, type, amount, description, category, sourceAccount, targetAccount, date, timestamp, createdAt, updatedAt, is_synced',
      settings: 'key, value'
    });
  }
}

export const db = new CashFlowDatabase();

// --- LocalStorage Utilities ---

function getLocalStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from LocalStorage:`, e);
    return fallback;
  }
}

function setLocalStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to LocalStorage:`, e);
  }
}

// Seamless migration on startup from Dexie to LocalStorage if needed
let migrationChecked = false;
async function ensureDataLoaded(): Promise<void> {
  if (migrationChecked) return;
  migrationChecked = true;

  try {
    const lsTxs = getLocalStorageItem<Transaction[]>(LS_TRANSACTIONS_KEY, []);
    const lsSettings = getLocalStorageItem<Record<string, any>>(LS_SETTINGS_KEY, {});

    // If localStorage is empty, try importing from Dexie
    if (lsTxs.length === 0 && (!lsSettings || Object.keys(lsSettings).length === 0)) {
      const dexieTxs = await db.transactions.toArray();
      const dexieSettings = await db.settings.toArray();

      if (dexieTxs.length > 0) {
        setLocalStorageItem(LS_TRANSACTIONS_KEY, dexieTxs);
      }
      if (dexieSettings.length > 0) {
        const settingsMap: Record<string, any> = {};
        dexieSettings.forEach(s => {
          settingsMap[s.key] = s.value;
        });
        setLocalStorageItem(LS_SETTINGS_KEY, settingsMap);
      }
    }
  } catch (err) {
    console.warn('Migration check warning:', err);
  }
}

// --- Setup & Settings Operations ---

export async function isSetupDone(): Promise<boolean> {
  await ensureDataLoaded();
  const settings = getLocalStorageItem<Record<string, any>>(LS_SETTINGS_KEY, {});
  if (settings.setup_done) return true;

  // Fallback check in Dexie
  try {
    const rec = await db.settings.get('setup_done');
    return !!(rec && rec.value);
  } catch {
    return false;
  }
}

export async function saveInitialBalances(work: number, personal: number): Promise<void> {
  await ensureDataLoaded();
  const settings = getLocalStorageItem<Record<string, any>>(LS_SETTINGS_KEY, {});
  settings.setup_done = true;
  settings.init_work = Number(work) || 0;
  settings.init_pers = Number(personal) || 0;
  setLocalStorageItem(LS_SETTINGS_KEY, settings);

  // Mirror to Dexie for redundancy
  try {
    await db.settings.bulkPut([
      { key: 'setup_done', value: true },
      { key: 'init_work', value: Number(work) || 0 },
      { key: 'init_pers', value: Number(personal) || 0 }
    ]);
  } catch {}
}

export async function getInitialBalances(): Promise<{ initWork: number; initPers: number }> {
  await ensureDataLoaded();
  const settings = getLocalStorageItem<Record<string, any>>(LS_SETTINGS_KEY, {});
  return {
    initWork: Number(settings.init_work) || 0,
    initPers: Number(settings.init_pers) || 0
  };
}

// --- Balance Calculation ---

export async function calculateBalances(): Promise<{
  balances: Balances;
  breakdown: ExpenseBreakdown;
}> {
  await ensureDataLoaded();
  const { initWork, initPers } = await getInitialBalances();
  const txs = getLocalStorageItem<Transaction[]>(LS_TRANSACTIONS_KEY, []);

  let workBalance = initWork;
  let persBalance = initPers;

  let workExpenses = 0;
  let personalExpenses = 0;
  let workIncome = 0;
  let personalIncome = 0;
  let workTransfersIn = 0;
  let workTransfersOut = 0;
  let personalTransfersIn = 0;
  let personalTransfersOut = 0;

  for (const t of txs) {
    const amt = Number(t.amount) || 0;

    if (t.type === 'income') {
      if (t.sourceAccount === 'work') {
        workBalance += amt;
        workIncome += amt;
      } else {
        persBalance += amt;
        personalIncome += amt;
      }
    } else if (t.type === 'expense') {
      if (t.sourceAccount === 'work') {
        workBalance -= amt;
      } else {
        persBalance -= amt;
      }

      if (t.category === 'work') {
        workExpenses += amt;
      } else {
        personalExpenses += amt;
      }
    } else if (t.type === 'transfer') {
      if (t.sourceAccount === 'work') {
        workBalance -= amt;
        workTransfersOut += amt;
      } else {
        persBalance -= amt;
        personalTransfersOut += amt;
      }

      if (t.targetAccount === 'work') {
        workBalance += amt;
        workTransfersIn += amt;
      } else if (t.targetAccount === 'personal') {
        persBalance += amt;
        personalTransfersIn += amt;
      }
    }
  }

  return {
    balances: {
      work: workBalance,
      personal: persBalance,
      total: workBalance + persBalance
    },
    breakdown: {
      workExpenses,
      personalExpenses,
      workIncome,
      personalIncome,
      workTransfersIn,
      workTransfersOut,
      personalTransfersIn,
      personalTransfersOut
    }
  };
}

// --- Transactions CRUD ---

export async function getAllTransactions(): Promise<Transaction[]> {
  await ensureDataLoaded();
  const txs = getLocalStorageItem<Transaction[]>(LS_TRANSACTIONS_KEY, []);
  return [...txs].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export async function addTransaction(data: {
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  description: string;
  category: string;
  sourceAccount: 'work' | 'personal';
  targetAccount?: 'work' | 'personal' | null;
  date?: string;
}): Promise<number> {
  await ensureDataLoaded();
  const now = Date.now();
  const dateStr = data.date || new Date().toLocaleDateString('en-CA');
  const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'tx_' + now + '_' + Math.random().toString(36).substring(2, 9);
  const isoNow = new Date().toISOString();

  const txs = getLocalStorageItem<Transaction[]>(LS_TRANSACTIONS_KEY, []);
  const nextId = txs.reduce((max, t) => Math.max(max, t.id || 0), 0) + 1;

  const newTx: Transaction = {
    id: nextId,
    uuid,
    type: data.type,
    amount: Number(data.amount),
    description: data.description.trim(),
    category: data.type === 'income' ? data.sourceAccount : data.category,
    sourceAccount: data.sourceAccount,
    targetAccount: data.type === 'transfer' ? (data.targetAccount || (data.sourceAccount === 'work' ? 'personal' : 'work')) : null,
    date: dateStr,
    timestamp: now,
    createdAt: isoNow,
    updatedAt: isoNow,
    is_synced: 0
  };

  txs.push(newTx);
  setLocalStorageItem(LS_TRANSACTIONS_KEY, txs);

  // Mirror to Dexie
  try {
    await db.transactions.add(newTx);
  } catch {}

  return nextId;
}

export async function deleteTransaction(id: number): Promise<void> {
  await ensureDataLoaded();
  let txs = getLocalStorageItem<Transaction[]>(LS_TRANSACTIONS_KEY, []);
  txs = txs.filter(t => t.id !== id);
  setLocalStorageItem(LS_TRANSACTIONS_KEY, txs);

  try {
    await db.transactions.delete(id);
  } catch {}
}

// --- Notes CRUD (Stored 100% in LocalStorage) ---

export async function getNotes(): Promise<Note[]> {
  const notes = getLocalStorageItem<Note[]>(LS_NOTES_KEY, []);
  // Sort: pinned notes first, then latest by timestamp
  return [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.timestamp || 0) - (a.timestamp || 0);
  });
}

export async function saveNote(noteData: {
  id?: string;
  title: string;
  content: string;
  category: NoteCategory;
  date?: string;
  color?: string;
  isPinned?: boolean;
  reminderDate?: string;
}): Promise<Note> {
  const notes = getLocalStorageItem<Note[]>(LS_NOTES_KEY, []);
  const now = Date.now();
  const dateStr = noteData.date || new Date().toLocaleDateString('en-CA');

  if (noteData.id) {
    // Edit existing note
    const index = notes.findIndex(n => n.id === noteData.id);
    if (index !== -1) {
      const updatedNote: Note = {
        ...notes[index],
        title: noteData.title.trim(),
        content: noteData.content.trim(),
        category: noteData.category,
        date: dateStr,
        color: noteData.color || notes[index].color || 'slate',
        isPinned: noteData.isPinned ?? notes[index].isPinned,
        reminderDate: noteData.reminderDate || undefined,
        updatedAt: new Date().toISOString()
      };
      notes[index] = updatedNote;
      setLocalStorageItem(LS_NOTES_KEY, notes);
      return updatedNote;
    }
  }

  // Create new note
  const newId = 'note_' + now + '_' + Math.random().toString(36).substring(2, 9);
  const newNote: Note = {
    id: newId,
    title: noteData.title.trim(),
    content: noteData.content.trim(),
    category: noteData.category,
    date: dateStr,
    timestamp: now,
    color: noteData.color || 'slate',
    isPinned: noteData.isPinned || false,
    reminderDate: noteData.reminderDate || undefined,
    updatedAt: new Date().toISOString()
  };

  notes.unshift(newNote);
  setLocalStorageItem(LS_NOTES_KEY, notes);
  return newNote;
}

export async function deleteNote(id: string): Promise<void> {
  let notes = getLocalStorageItem<Note[]>(LS_NOTES_KEY, []);
  notes = notes.filter(n => n.id !== id);
  setLocalStorageItem(LS_NOTES_KEY, notes);
}

export async function togglePinNote(id: string): Promise<boolean> {
  const notes = getLocalStorageItem<Note[]>(LS_NOTES_KEY, []);
  const note = notes.find(n => n.id === id);
  if (!note) return false;
  note.isPinned = !note.isPinned;
  setLocalStorageItem(LS_NOTES_KEY, notes);
  return note.isPinned;
}

// --- Import & Export Operations ---

export async function exportDataJSON(): Promise<string> {
  await ensureDataLoaded();
  const txs = getLocalStorageItem<Transaction[]>(LS_TRANSACTIONS_KEY, []);
  const settings = getLocalStorageItem<Record<string, any>>(LS_SETTINGS_KEY, {});
  const notes = getLocalStorageItem<Note[]>(LS_NOTES_KEY, []);

  return JSON.stringify({
    version: 3,
    appName: 'العهدة والمصاريف',
    exportedAt: new Date().toISOString(),
    txs,
    settings,
    notes
  }, null, 2);
}

export async function importDataJSON(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.txs || !Array.isArray(data.txs)) {
      throw new Error('الملف غير صالح أو لا يحتوي على معاملات.');
    }

    setLocalStorageItem(LS_TRANSACTIONS_KEY, data.txs);

    if (data.settings && typeof data.settings === 'object') {
      setLocalStorageItem(LS_SETTINGS_KEY, data.settings);
    }

    if (data.notes && Array.isArray(data.notes)) {
      setLocalStorageItem(LS_NOTES_KEY, data.notes);
    }

    // Mirror to Dexie
    try {
      await db.transaction('rw', db.transactions, db.settings, async () => {
        await db.transactions.clear();
        await db.settings.clear();
        await db.transactions.bulkAdd(data.txs);
      });
    } catch {}

    return true;
  } catch (err) {
    console.error('Import error:', err);
    throw err;
  }
}

export async function exportDataCSV(): Promise<string> {
  const txs = await getAllTransactions();
  let csv = "ID,Date,Type,Amount,Description,Category,SourceAccount,TargetAccount\n";
  for (const t of txs) {
    const typeLabel = t.type === 'expense' ? 'مصروف' : (t.type === 'income' ? 'إيداع' : 'تحويل');
    const catLabel = t.category === 'work' ? 'شغل' : (t.category === 'personal' ? 'شخصي' : t.category);
    const sourceLabel = t.sourceAccount === 'work' ? 'عهدة الشغل' : 'فلوسي الشخصية';
    const targetLabel = t.targetAccount ? (t.targetAccount === 'work' ? 'عهدة الشغل' : 'فلوسي الشخصية') : '';
    const safeDesc = `"${(t.description || '').replace(/"/g, '""')}"`;

    csv += `${t.id || ''},${t.date},${typeLabel},${t.amount},${safeDesc},${catLabel},${sourceLabel},${targetLabel}\n`;
  }
  return "\ufeff" + csv;
}

export async function resetAllData(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LS_TRANSACTIONS_KEY);
    localStorage.removeItem(LS_SETTINGS_KEY);
    localStorage.removeItem(LS_NOTES_KEY);
  }

  try {
    await db.transaction('rw', db.transactions, db.settings, async () => {
      await db.transactions.clear();
      await db.settings.clear();
    });
  } catch {}
}
