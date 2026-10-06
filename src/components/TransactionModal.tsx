import React, { useState, useEffect } from 'react';
import { X, MinusCircle, PlusCircle, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import type { TransactionType, AccountType, CategoryType, Balances } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  type: TransactionType;
  balances: Balances;
  onClose: () => void;
  onSave: (data: {
    type: TransactionType;
    amount: number;
    description: string;
    category: CategoryType | string;
    sourceAccount: AccountType;
    targetAccount?: AccountType | null;
    date: string;
  }) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  type,
  balances,
  onClose,
  onSave
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sourceAccount, setSourceAccount] = useState<AccountType>('work');
  const [category, setCategory] = useState<CategoryType>('work');
  const [targetAccount, setTargetAccount] = useState<AccountType>('personal');
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
      setDate(new Date().toLocaleDateString('en-CA'));
      
      if (type === 'expense') {
        setSourceAccount('work');
        setCategory('work');
      } else if (type === 'income') {
        setSourceAccount('work');
        setCategory('work');
      } else if (type === 'transfer') {
        setSourceAccount('work');
        setTargetAccount('personal');
      }
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleSourceChange = (newSource: AccountType) => {
    setSourceAccount(newSource);
    if (type === 'transfer') {
      setTargetAccount(newSource === 'work' ? 'personal' : 'work');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }

    if (!description.trim() && type !== 'transfer') {
      alert('يرجى كتابة وصف للعملية');
      return;
    }

    // Check balance if expense or transfer
    if (type === 'expense' || type === 'transfer') {
      const currentBal = sourceAccount === 'work' ? balances.work : balances.personal;
      if (numAmount > currentBal) {
        const confirmNegative = window.confirm(
          `تنبيه: الرصيد الحالي (${currentBal.toLocaleString()} ج.م) غير كافٍ. هل تريد الاستمرار برصيد سالب؟`
        );
        if (!confirmNegative) return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSave({
        type,
        amount: numAmount,
        description: description.trim() || (type === 'transfer' ? 'تحويل بين المحافظ' : 'عملية مالية'),
        category: type === 'income' ? sourceAccount : category,
        sourceAccount,
        targetAccount: type === 'transfer' ? targetAccount : null,
        date: date || new Date().toLocaleDateString('en-CA')
      });
      onClose();
    } catch (err) {
      console.error('Error saving transaction:', err);
      alert('حدث خطأ أثناء حفظ العملية');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (type === 'expense') return 'تسجيل مصروف جديد';
    if (type === 'income') return 'إضافة رصيد (إيداع)';
    return 'تحويل بين المحافظ';
  };

  const getHeaderIcon = () => {
    if (type === 'expense') return <MinusCircle className="w-6 h-6 text-red-500" />;
    if (type === 'income') return <PlusCircle className="w-6 h-6 text-emerald-500" />;
    return <ArrowLeftRight className="w-6 h-6 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 shadow-2xl border border-[#E2E8F0] animate-in slide-in-from-bottom-6 duration-200 safe-bottom">
        <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            {getHeaderIcon()}
            <h2 className="text-lg font-black text-[#1E293B]">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Amount input */}
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
            <label className="block text-xs font-bold text-[#64748B] mb-1">المبلغ المطلوب (EGP)</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full bg-transparent border-b-2 border-[#CBD5E1] focus:border-[#0F172A] p-2 text-3xl md:text-4xl font-black text-[#1E293B] outline-none transition-all placeholder:text-[#94A3B8]"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-black text-[#64748B]">ج.م</span>
            </div>
          </div>

          {/* Description input */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1.5">بيان الوصف / الغرض</label>
            <input
              type="text"
              required={type !== 'transfer'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'transfer' ? 'تحويل بين الأرصدة (اختياري)' : 'مثلاً: بنزين، فاتورة كهرباء، غداء عمل، صيانة...'}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:bg-white focus:border-[#3B82F6] p-3 rounded-2xl text-sm font-semibold text-[#1E293B] outline-none transition-all"
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1.5">تاريخ العملية</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:bg-white focus:border-[#3B82F6] p-3 rounded-2xl text-sm font-semibold text-[#1E293B] outline-none transition-all"
            />
          </div>

          {/* Source Account */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1.5">
              {type === 'transfer' ? 'التحويل من (المصدر)' : 'مصدر المال (الحساب المسحوب منه)'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSourceChange('work')}
                className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sourceAccount === 'work'
                    ? 'bg-[#EFF6FF] border-[#3B82F6] text-[#1D4ED8] shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-slate-100'
                }`}
              >
                <span>💼 عهدة الشغل</span>
              </button>
              <button
                type="button"
                onClick={() => handleSourceChange('personal')}
                className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sourceAccount === 'personal'
                    ? 'bg-[#DCFCE7] border-[#10B981] text-[#166534] shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-slate-100'
                }`}
              >
                <span>👤 فلوسي الشخصية</span>
              </button>
            </div>
          </div>

          {/* Category Selection (For Expense) */}
          {type === 'expense' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#64748B]">نوع وتصنيف المصروف</label>
                <span className="text-[10px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-blue-100">
                  يمكن دفع مصروف شغل من المال الشخصي
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCategory('work')}
                  className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    category === 'work'
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-slate-100'
                  }`}
                >
                  <span>🏢 مصروف شغل (عهدة)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('personal')}
                  className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    category === 'personal'
                      ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-slate-100'
                  }`}
                >
                  <span>🏠 مصروف شخصي</span>
                </button>
              </div>
            </div>
          )}

          {/* Transfer Target (For Transfer) */}
          {type === 'transfer' && (
            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1.5">التحويل إلى (الوجهة)</label>
              <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#1E293B] flex items-center justify-between">
                <span>{targetAccount === 'personal' ? '👤 فلوسي الشخصية' : '💼 عهدة الشغل'}</span>
                <span className="text-xs font-medium text-[#64748B]">(تلقائي عكس المصدر)</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-bold text-base shadow-md transition-all active:scale-[0.98] text-white flex items-center justify-center gap-2 cursor-pointer ${
                type === 'expense'
                  ? 'bg-[#EF4444] hover:bg-red-600'
                  : type === 'income'
                  ? 'bg-[#10B981] hover:bg-emerald-600'
                  : 'bg-[#0F172A] hover:bg-[#1E293B]'
              }`}
            >
              <span>{isSubmitting ? 'جارٍ الحفظ...' : 'حفظ العملية'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
