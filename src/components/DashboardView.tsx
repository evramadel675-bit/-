import React from 'react';
import { 
  Briefcase, 
  User, 
  Wallet, 
  TrendingDown, 
  MinusCircle, 
  PlusCircle, 
  ArrowLeftRight, 
  Trash2, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import type { Balances, ExpenseBreakdown, Transaction, TransactionType } from '../types';
import { formatAmount } from '../utils/format';

interface DashboardViewProps {
  balances: Balances;
  breakdown: ExpenseBreakdown;
  recentTransactions: Transaction[];
  onOpenModal: (type: TransactionType) => void;
  onDeleteTransaction: (id: number) => void;
  onViewAllTransactions: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  balances,
  breakdown,
  recentTransactions,
  onOpenModal,
  onDeleteTransaction,
  onViewAllTransactions
}) => {
  return (
    <div className="space-y-6">
      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Work Balance Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#64748B] text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>عهدة الشغل</span>
              </p>
              <h2 className={`text-3xl md:text-4xl font-black mb-1 tracking-tight ${balances.work < 0 ? 'text-[#EF4444]' : 'text-[#1E293B]'}`}>
                {formatAmount(balances.work)} <span className="text-base font-bold text-[#64748B]">ج.م</span>
              </h2>
              <div className="text-xs text-[#10B981] font-semibold mt-1 flex items-center gap-1">
                <span>الرصيد المتاح للعمل</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shadow-xs">
              <span className="text-lg">💼</span>
            </div>
          </div>
        </div>

        {/* Personal Balance Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#64748B] text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#10B981]" />
                <span>فلوسي الشخصية</span>
              </p>
              <h2 className={`text-3xl md:text-4xl font-black mb-1 tracking-tight ${balances.personal < 0 ? 'text-[#EF4444]' : 'text-[#1E293B]'}`}>
                {formatAmount(balances.personal)} <span className="text-base font-bold text-[#64748B]">ج.م</span>
              </h2>
              <div className="text-xs text-[#64748B] font-medium mt-1">
                <span>المحفظة الشخصية</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center shadow-xs">
              <span className="text-lg">👤</span>
            </div>
          </div>
        </div>

        {/* Total Cash Card */}
        <div className="bg-[#1E293B] p-6 rounded-3xl shadow-sm border border-[#334155] text-white hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-300 text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
                <span>إجمالي الكاش المتوفر</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-black mb-1 tracking-tight text-white">
                {formatAmount(balances.total)} <span className="text-base font-bold text-slate-400">ج.م</span>
              </h2>
              <div className="text-xs text-slate-300 font-medium mt-1">
                <span>الرصيد الكلي الإجمالي</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#334155] text-[#10B981] flex items-center justify-center border border-[#475569]">
              <span className="text-lg">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Overview Pills */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#E2E8F0] grid grid-cols-2 gap-4 divide-x divide-[#F1F5F9]">
        <div className="text-center pl-2">
          <p className="text-xs font-bold text-[#64748B] flex items-center justify-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>إجمالي مصاريف الشغل</span>
          </p>
          <p className="font-extrabold text-[#EF4444] text-lg mt-1">
            {formatAmount(breakdown.workExpenses)} <span className="text-xs font-medium text-[#64748B]">ج.م</span>
          </p>
        </div>
        <div className="text-center pr-2">
          <p className="text-xs font-bold text-[#64748B] flex items-center justify-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>إجمالي المصاريف الشخصية</span>
          </p>
          <p className="font-extrabold text-rose-600 text-lg mt-1">
            {formatAmount(breakdown.personalExpenses)} <span className="text-xs font-medium text-[#64748B]">ج.م</span>
          </p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => onOpenModal('expense')}
          className="bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.98] text-white p-4 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-2.5 shadow-md shadow-slate-900/10 transition-all cursor-pointer"
        >
          <span className="text-lg">➕</span>
          <span>إضافة مصروف</span>
        </button>

        <button
          onClick={() => onOpenModal('income')}
          className="bg-[#10B981] hover:bg-[#059669] active:scale-[0.98] text-white p-4 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-2.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 shrink-0" />
          <span>إضافة رصيد / إيداع</span>
        </button>

        <button
          onClick={() => onOpenModal('transfer')}
          className="bg-white border-2 border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] active:scale-[0.98] p-4 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
        >
          <span className="text-lg">💸</span>
          <span>تحويل رصيد</span>
        </button>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="p-5 md:p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <h3 className="font-bold text-lg text-[#1E293B] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#3B82F6]" />
            <span>آخر العمليات</span>
          </h3>
          {recentTransactions.length > 0 && (
            <button
              onClick={onViewAllTransactions}
              className="text-xs font-bold text-[#3B82F6] hover:text-[#2563EB] flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-[#CBD5E1] shadow-2xs hover:bg-slate-50"
            >
              <span>عرض الكل</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[#64748B] text-sm">لا توجد عمليات مسجلة حتى الآن.</p>
            <p className="text-xs text-[#64748B] mt-1">اضغط على أحد الأزرار بالأعلى لإضافة أول حركة مالية.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {recentTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              const sourceLabel = tx.sourceAccount === 'work' ? 'عهدة الشغل' : 'فلوسي الشخصية';
              const targetLabel = tx.targetAccount === 'work' ? 'عهدة الشغل' : 'فلوسي الشخصية';
              const catLabel = tx.category === 'work' ? 'شغل' : 'شخصي';

              return (
                <div
                  key={tx.id || tx.uuid}
                  className="p-4 md:px-6 hover:bg-[#F8FAFC] flex justify-between items-center transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                      isExpense ? 'bg-red-50 text-[#EF4444]' : isIncome ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#EFF6FF] text-[#3B82F6]'
                    }`}>
                      {isExpense && <MinusCircle className="w-5 h-5" />}
                      {isIncome && <PlusCircle className="w-5 h-5" />}
                      {isTransfer && <ArrowLeftRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#1E293B] truncate">
                        {tx.description || (isTransfer ? `تحويل من ${sourceLabel} إلى ${targetLabel}` : 'بدون وصف')}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 truncate">
                        {tx.date} • من: {sourceLabel}
                        {isTransfer && ` ← إلى: ${targetLabel}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pr-2">
                    <div className="text-left">
                      <p className={`font-extrabold text-sm md:text-base ${isExpense ? 'text-[#EF4444]' : isIncome ? 'text-[#10B981]' : 'text-[#3B82F6]'}`}>
                        {isExpense ? '-' : isIncome ? '+' : '↔'} {formatAmount(tx.amount)} <span className="text-xs font-normal text-[#64748B]">ج.م</span>
                      </p>
                      <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] font-semibold mt-0.5">
                        {catLabel}
                      </span>
                    </div>

                    <button
                      onClick={() => tx.id && onDeleteTransaction(tx.id)}
                      className="p-2 text-slate-300 hover:text-[#EF4444] hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="حذف العملية"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
