import React, { useState } from 'react';
import { Wallet, ShieldCheck, ArrowLeft } from 'lucide-react';

interface SetupModalProps {
  onComplete: (work: number, personal: number) => Promise<void>;
}

export const SetupModal: React.FC<SetupModalProps> = ({ onComplete }) => {
  const [initWork, setInitWork] = useState('');
  const [initPers, setInitPers] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const workVal = parseFloat(initWork) || 0;
      const persVal = parseFloat(initPers) || 0;
      await onComplete(workVal, persVal);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#EFF6FF] text-[#3B82F6] rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#1E293B]">مرحباً بك.. لنبدأ الإعداد</h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">حدد رصيد البداية لكل من عهدة العمل وأموالك الخاصة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1.5 flex items-center gap-1.5">
              <span>💼</span> عهدة الشغل الحالية (EGP)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={initWork}
                onChange={(e) => setInitWork(e.target.value)}
                placeholder="0.00"
                className="w-full border border-[#CBD5E1] bg-[#F8FAFC] p-3.5 rounded-2xl text-lg font-bold text-[#1E293B] outline-none focus:bg-white focus:border-[#3B82F6] transition-all"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#64748B]">ج.م</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1.5 flex items-center gap-1.5">
              <span>👤</span> فلوسي الشخصية الحالية (EGP)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={initPers}
                onChange={(e) => setInitPers(e.target.value)}
                placeholder="0.00"
                className="w-full border border-[#CBD5E1] bg-[#F8FAFC] p-3.5 rounded-2xl text-lg font-bold text-[#1E293B] outline-none focus:bg-white focus:border-[#3B82F6] transition-all"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#64748B]">ج.م</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.98] text-white py-4 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-[#10B981]" />
              <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ والبدء'}</span>
              <ArrowLeft className="w-4 h-4 mr-1" />
            </button>
          </div>
          
          <p className="text-[11px] text-center text-[#94A3B8] mt-3">
            جميع البيانات تُحفظ محلياً داخل جهازك بشكل آمن وسريع عبر IndexedDB.
          </p>
        </form>
      </div>
    </div>
  );
};
