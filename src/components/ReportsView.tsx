import React from 'react';
import { Briefcase, User, TrendingUp, TrendingDown, Wallet, ArrowDownRight } from 'lucide-react';
import type { Balances, ExpenseBreakdown } from '../types';
import { formatAmount } from '../utils/format';

interface ReportsViewProps {
  balances: Balances;
  breakdown: ExpenseBreakdown;
  initWork: number;
  initPers: number;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  balances,
  breakdown,
  initWork,
  initPers
}) => {
  const totalWorkIn = initWork + breakdown.workIncome + breakdown.workTransfersIn;
  const totalWorkOut = breakdown.workExpenses;

  const totalPersIn = initPers + breakdown.personalIncome + breakdown.personalTransfersIn;
  const totalPersOut = breakdown.personalExpenses;

  return (
    <div className="space-y-6">
      {/* Overview Hero */}
      <div className="bg-[#1E293B] rounded-3xl p-6 text-white shadow-sm border border-[#334155]">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Wallet className="w-4 h-4 text-[#10B981]" />
          <span>التقرير المالي العام</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mt-2">
          <div>
            <p className="text-xs text-slate-300">إجمالي الكاش المتوفر حالياً</p>
            <h2 className="text-3xl md:text-4xl font-black mt-1 text-white">
              {formatAmount(balances.total)} <span className="text-sm font-normal text-slate-300">ج.م</span>
            </h2>
          </div>
          <div className="text-right sm:text-left text-xs bg-[#334155] px-4 py-2.5 rounded-2xl border border-[#475569]">
            <p className="text-slate-300 font-medium">إجمالي المصروفات الكلية</p>
            <p className="font-black text-base text-[#EF4444] mt-0.5">
              {formatAmount(breakdown.workExpenses + breakdown.personalExpenses)} ج.م
            </p>
          </div>
        </div>
      </div>

      {/* Work Advance Card Report */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0]">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E293B]">ملخص عهدة الشغل</h3>
              <p className="text-xs text-[#64748B]">تقرير تدفقات ومصروفات العمل</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#3B82F6] bg-[#EFF6FF] px-3 py-1 rounded-full border border-blue-100">
            عهدة العمل
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center text-[#475569]">
            <span className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-[#10B981]" />
              <span>رصيد البداية المعتمد:</span>
            </span>
            <span className="font-bold text-[#1E293B]">{formatAmount(initWork)} ج.م</span>
          </div>

          <div className="flex justify-between items-center text-[#475569]">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <span>إجمالي المستلم (إيداعات + تحويلات واردة):</span>
            </span>
            <span className="text-[#10B981] font-bold">
              +{formatAmount(totalWorkIn)} ج.م
            </span>
          </div>

          <div className="flex justify-between items-center text-[#475569]">
            <span className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#EF4444]" />
              <span>إجمالي المصاريف المسجلة:</span>
            </span>
            <span className="text-[#EF4444] font-bold">
              -{formatAmount(totalWorkOut)} ج.م
            </span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0] font-bold text-base">
            <span className="text-[#1E293B]">صافي العهدة المتبقي:</span>
            <span className={`text-xl font-black ${balances.work < 0 ? 'text-[#EF4444]' : 'text-[#3B82F6]'}`}>
              {formatAmount(balances.work)} ج.م
            </span>
          </div>
        </div>
      </div>

      {/* Personal Money Card Report */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0]">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E293B]">ملخص الفلوس الشخصية</h3>
              <p className="text-xs text-[#64748B]">تقرير المصاريف والمدخرات الخاصة</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#166534] bg-[#DCFCE7] px-3 py-1 rounded-full border border-emerald-100">
            شخصي
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center text-[#475569]">
            <span className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-[#10B981]" />
              <span>رصيد البداية المعتمد:</span>
            </span>
            <span className="font-bold text-[#1E293B]">{formatAmount(initPers)} ج.م</span>
          </div>

          <div className="flex justify-between items-center text-[#475569]">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <span>إجمالي المضاف (إيداعات + تحويلات واردة):</span>
            </span>
            <span className="text-[#10B981] font-bold">
              +{formatAmount(totalPersIn)} ج.م
            </span>
          </div>

          <div className="flex justify-between items-center text-[#475569]">
            <span className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#EF4444]" />
              <span>إجمالي المصاريف الشخصية:</span>
            </span>
            <span className="text-[#EF4444] font-bold">
              -{formatAmount(totalPersOut)} ج.م
            </span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0] font-bold text-base">
            <span className="text-[#1E293B]">صافي الخاص الحالي:</span>
            <span className={`text-xl font-black ${balances.personal < 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
              {formatAmount(balances.personal)} ج.م
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

