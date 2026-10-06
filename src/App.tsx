import React, { useState, useEffect, useCallback } from 'react';
import { 
  db, 
  isSetupDone, 
  saveInitialBalances, 
  getInitialBalances, 
  calculateBalances, 
  addTransaction, 
  deleteTransaction, 
  exportDataJSON, 
  importDataJSON, 
  exportDataCSV, 
  resetAllData,
  getNotes,
  saveNote,
  deleteNote,
  togglePinNote
} from './db';
import type { ActiveTab, Balances, ExpenseBreakdown, Transaction, TransactionType, AccountType, CategoryType, Note, NoteCategory } from './types';
import { usePWA } from './hooks/usePWA';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { NotesView } from './components/NotesView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { BottomNavigation } from './components/BottomNavigation';
import { TransactionModal } from './components/TransactionModal';
import { SetupModal } from './components/SetupModal';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const {
    canInstall,
    isInstalled,
    isStandalone,
    isOnline,
    swUpdateAvailable,
    installApp,
    updateServiceWorker
  } = usePWA();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showSetup, setShowSetup] = useState(false);
  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [balances, setBalances] = useState<Balances>({ work: 0, personal: 0, total: 0 });
  const [breakdown, setBreakdown] = useState<ExpenseBreakdown>({
    workExpenses: 0,
    personalExpenses: 0,
    workIncome: 0,
    personalIncome: 0,
    workTransfersIn: 0,
    workTransfersOut: 0,
    personalTransfersIn: 0,
    personalTransfersOut: 0
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [initWork, setInitWork] = useState(0);
  const [initPers, setInitPers] = useState(0);

  // Load all data from storage
  const loadData = useCallback(async () => {
    try {
      const setupFinished = await isSetupDone();
      if (!setupFinished) {
        setShowSetup(true);
        setIsLoading(false);
        return;
      }

      setShowSetup(false);
      const [initials, calcData, allTxs, allNotes] = await Promise.all([
        getInitialBalances(),
        calculateBalances(),
        db.transactions.orderBy('timestamp').reverse().toArray(),
        getNotes()
      ]);

      setInitWork(initials.initWork);
      setInitPers(initials.initPers);
      setBalances(calcData.balances);
      setBreakdown(calcData.breakdown);
      setTransactions(allTxs);
      setNotes(allNotes);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // First time setup handler
  const handleCompleteSetup = async (work: number, personal: number) => {
    await saveInitialBalances(work, personal);
    await loadData();
  };

  // Add Transaction handler
  const handleSaveTransaction = async (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: CategoryType | string;
    sourceAccount: AccountType;
    targetAccount?: AccountType | null;
    date: string;
  }) => {
    await addTransaction(data);
    await loadData();
  };

  // Delete Transaction handler
  const handleDeleteTransaction = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه العملية؟')) {
      await deleteTransaction(id);
      await loadData();
    }
  };

  // Notes handlers
  const handleSaveNote = async (noteData: {
    id?: string;
    title: string;
    content: string;
    category: NoteCategory;
    color?: string;
    isPinned?: boolean;
    reminderDate?: string;
  }) => {
    await saveNote(noteData);
    const updatedNotes = await getNotes();
    setNotes(updatedNotes);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    const updatedNotes = await getNotes();
    setNotes(updatedNotes);
  };

  const handleTogglePin = async (id: string) => {
    await togglePinNote(id);
    const updatedNotes = await getNotes();
    setNotes(updatedNotes);
  };

  // Export JSON backup
  const handleExportJSON = async () => {
    const jsonString = await exportDataJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportJSON = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        await importDataJSON(text);
        alert('تم استيراد النسخة الاحتياطية بنجاح!');
        await loadData();
      } catch (err: any) {
        alert('خطأ في استيراد البيانات: ' + (err.message || 'الملف تالف'));
      }
    };
    reader.readAsText(file);
  };

  // Export CSV
  const handleExportCSV = async () => {
    const csvContent = await exportDataCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset App
  const handleResetApp = async () => {
    const confirm1 = window.confirm('هل أنت متأكد تماماً من مسح كافة العمليات والملاحظات والإعدادات؟');
    if (!confirm1) return;
    const confirm2 = window.confirm('تأكيد نهائي: سيتم حذف جميع البيانات ولا يمكن التراجع بعد هذه الخطوة.');
    if (!confirm2) return;

    await resetAllData();
    await loadData();
  };

  // Update initial balances
  const handleUpdateInitialBalances = async (work: number, personal: number) => {
    await saveInitialBalances(work, personal);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#0F172A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-[#1E293B]">جارٍ تحميل تطبيق مصاريفي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans selection:bg-[#0F172A] selection:text-white">
      {/* Top Header */}
      <Header
        isOnline={isOnline}
        isStandalone={isStandalone}
        swUpdateAvailable={swUpdateAvailable}
        onUpdateSw={updateServiceWorker}
      />

      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="bg-[#FEF3C7] border-b border-[#FDE68A] text-[#92400E] px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706]" />
          <span>أنت تعمل الآن في وضع الأوفلاين الكامل (Full Offline Mode). كافة البيانات تُحفظ محلياً.</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 pb-28">
        {activeTab === 'dashboard' && (
          <DashboardView
            balances={balances}
            breakdown={breakdown}
            recentTransactions={transactions.slice(0, 5)}
            onOpenModal={(type) => setModalType(type)}
            onDeleteTransaction={handleDeleteTransaction}
            onViewAllTransactions={() => setActiveTab('transactions')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'notes' && (
          <NotesView
            notes={notes}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            balances={balances}
            breakdown={breakdown}
            initWork={initWork}
            initPers={initPers}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            canInstall={canInstall}
            isInstalled={isInstalled}
            isStandalone={isStandalone}
            onInstallApp={installApp}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            onExportCSV={handleExportCSV}
            onResetApp={handleResetApp}
            initWork={initWork}
            initPers={initPers}
            onUpdateInitialBalances={handleUpdateInitialBalances}
          />
        )}
      </main>

      {/* Transaction Entry Modal */}
      {modalType && (
        <TransactionModal
          isOpen={!!modalType}
          type={modalType}
          balances={balances}
          onClose={() => setModalType(null)}
          onSave={handleSaveTransaction}
        />
      )}

      {/* Setup Modal on first launch */}
      {showSetup && (
        <SetupModal onComplete={handleCompleteSetup} />
      )}

      {/* Bottom Tab Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        transactionCount={transactions.length}
        notesCount={notes.length}
      />
    </div>
  );
}

