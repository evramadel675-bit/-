import React, { useState, useMemo } from 'react';
import { Search, Filter, MinusCircle, PlusCircle, ArrowLeftRight, Trash2 } from 'lucide-react';
import type { Transaction, FilterType } from '../types';
import { formatAmount } from '../utils/format';

interface TransactionsViewProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onDeleteTransaction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (activeFilter === 'work') {
      list = list.filter((t) => t.category === 'work' || t.sourceAccount === 'work');
    } else if (activeFilter === 'personal') {
      list = list.filter((t) => t.category === 'personal' || t.sourceAccount === 'personal');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          t.amount.toString().includes(q) ||
          t.date.includes(q)
      );
    }

    return list;
  }, [transactions, activeFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Input & Controls */}
      <div className="bg-white p-3.5 rounded-3xl shadow-sm border border-[#E2E8F0] flex items-center gap-3">
        <Search className="w-5 h-5 text-[#64748B] shrink-0 mr-1" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث في الوصف، المبلغ، التاريخ..."
          className="w-full text-sm font-medium outline-none bg-transparent placeholder:text-[#64748B] text-[#1E293B]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-[#64748B] hover:text-[#1E293B] px-2 py-1 bg-[#F1F5F9] rounded-lg font-medium cursor-pointer"
          >
            مسح
          </button>
        )}
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-[#64748B] flex items-center gap-1 shrink-0 ml-1">
          <Filter className="w-3.5 h-3.5" />
          <span>تصفية:</span>
        </span>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#1E293B] text-white border border-[#1E293B] shadow-xs font-bold'
              : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
          }`}
        >
          الكل ({transactions.length})
        </button>
        <button
          onClick={() => setActiveFilter('work')}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeFilter === 'work'
              ? 'bg-[#1E293B] text-white border border-[#1E293B] shadow-xs font-bold'
              : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
          }`}
        >
          💼 عهدة الشغل
        </button>
        <button
          onClick={() => setActiveFilter('personal')}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeFilter === 'personal'
              ? 'bg-[#1E293B] text-white border border-[#1E293B] shadow-xs font-bold'
              : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
          }`}
        >
          👤 فلوسي الشخصية
        </button>
      </div>

      {/* Transactions Table / List Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="p-4 md:p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <h3 className="font-bold text-base text-[#1E293B]">
            سجل العمليات ({filteredTransactions.length})
          </h3>
          <span className="text-xs font-semibold text-[#64748B] bg-white border border-[#CBD5E1] px-3 py-1 rounded-full">
            مُحدث لحظياً
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#64748B] text-sm">لا توجد عمليات تطابق البحث أو الفلتر المحدد.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {filteredTransactions.map((tx) => {
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
                        {tx.date} • {sourceLabel}
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
