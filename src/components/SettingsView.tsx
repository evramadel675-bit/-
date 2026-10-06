import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Trash2, 
  Smartphone, 
  CheckCircle2, 
  Info, 
  ShieldAlert,
  Edit3,
  Check,
  X,
  Layers
} from 'lucide-react';
import { formatAmount } from '../utils/format';

interface SettingsViewProps {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  onInstallApp: () => Promise<boolean>;
  onExportJSON: () => Promise<void>;
  onImportJSON: (file: File) => Promise<void>;
  onExportCSV: () => Promise<void>;
  onResetApp: () => Promise<void>;
  initWork: number;
  initPers: number;
  onUpdateInitialBalances: (work: number, personal: number) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  canInstall,
  isInstalled,
  isStandalone,
  onInstallApp,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onResetApp,
  initWork,
  initPers,
  onUpdateInitialBalances
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingInit, setIsEditingInit] = useState(false);
  const [workInput, setWorkInput] = useState(initWork.toString());
  const [persInput, setPersInput] = useState(initPers.toString());
  const [isSavingInit, setIsSavingInit] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await onImportJSON(file);
    } catch (err: any) {
      alert('فشل استيراد الملف: ' + (err.message || 'الملف غير متوافق'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveInitial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInit(true);
    try {
      await onUpdateInitialBalances(parseFloat(workInput) || 0, parseFloat(persInput) || 0);
      setIsEditingInit(false);
    } finally {
      setIsSavingInit(false);
    }
  };

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await onInstallApp();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PWA Installation Card (Matches Professional Polish Design) */}
      <div className="bg-[#EFF6FF] p-6 rounded-3xl border-2 border-dashed border-[#3B82F6]">
        <h3 className="text-[#1D4ED8] font-bold text-base mb-2 flex items-center gap-2">
          <span>📱</span>
          <span>تثبيت التطبيق (Offline PWA)</span>
        </h3>
        <p className="text-[#1E40AF] text-sm leading-relaxed mb-4">
          استمتع بتجربة أسرع ووصول مباشر من الشاشة الرئيسية حتى بدون إنترنت مع حفظ كافة البيانات محلياً.
        </p>

        {isStandalone || isInstalled ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">التطبيق مثبت وجاهز للاستخدام أوفلاين!</p>
              <p className="text-xs text-emerald-700 mt-1">
                يعمل التطبيق الآن في وضع التطبيق المستقل بكفاءة عالية وبدون الحاجة لإنترنت.
              </p>
            </div>
          </div>
        ) : canInstall ? (
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="w-full bg-[#3B82F6] text-white py-3.5 rounded-2xl font-bold shadow-md hover:bg-[#2563EB] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-5 h-5" />
            <span>{installing ? 'جارٍ التثبيت...' : 'تثبيت التطبيق الآن'}</span>
          </button>
        ) : (
          <div className="bg-white/80 border border-blue-200 rounded-2xl p-4 text-[#1E40AF] text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>طريقة التثبيت السريع:</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-700">
              <li><strong>Chrome / أندرويد:</strong> اضغط على (⋮) ثم اختر <em>"تثبيت التطبيق"</em> أو <em>"إضافة إلى الشاشة الرئيسية"</em>.</li>
              <li><strong>Safari / آيفون:</strong> اضغط زر المشاركة ثم اختر <em>"Add to Home Screen"</em>.</li>
              <li><strong>كمبيوتر:</strong> اضغط على أيقونة التثبيت في شريط العنوان أعلى المتصفح.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Initial Balances Configuration */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E293B]">الأرصدة الافتتاحية المعتمدة</h3>
              <p className="text-xs text-[#64748B]">رصيد بداية العمل والمال الخاص</p>
            </div>
          </div>

          {!isEditingInit ? (
            <button
              onClick={() => {
                setWorkInput(initWork.toString());
                setPersInput(initPers.toString());
                setIsEditingInit(true);
              }}
              className="text-xs font-bold text-[#3B82F6] hover:text-[#2563EB] bg-[#EFF6FF] border border-blue-100 px-3.5 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              تعديل
            </button>
          ) : null}
        </div>

        {isEditingInit ? (
          <form onSubmit={handleSaveInitial} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1.5">رصيد عهدة الشغل الافتتاحي</label>
                <input
                  type="number"
                  step="any"
                  value={workInput}
                  onChange={(e) => setWorkInput(e.target.value)}
                  className="w-full border border-[#CBD5E1] bg-[#F8FAFC] p-3 rounded-2xl text-base font-bold text-[#1E293B] outline-none focus:bg-white focus:border-[#3B82F6]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1.5">رصيد الخاص الافتتاحي</label>
                <input
                  type="number"
                  step="any"
                  value={persInput}
                  onChange={(e) => setPersInput(e.target.value)}
                  className="w-full border border-[#CBD5E1] bg-[#F8FAFC] p-3 rounded-2xl text-base font-bold text-[#1E293B] outline-none focus:bg-white focus:border-[#3B82F6]"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsEditingInit(false)}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#475569] hover:bg-slate-50 cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> إلغاء
              </button>
              <button
                type="submit"
                disabled={isSavingInit}
                className="px-5 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold shadow-xs hover:bg-[#1E293B] cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> حفظ الأرصدة
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] font-bold block mb-1">عهدة الشغل:</span>
              <span className="font-black text-base text-[#1E293B]">{formatAmount(initWork)} ج.م</span>
            </div>
            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-[#64748B] font-bold block mb-1">المال الشخصي:</span>
              <span className="font-black text-base text-[#10B981]">{formatAmount(initPers)} ج.م</span>
            </div>
          </div>
        )}
      </div>

      {/* Backup, Restore & CSV Exports */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden divide-y divide-[#F1F5F9]">
        <button
          onClick={onExportJSON}
          className="w-full text-right p-4 md:p-5 hover:bg-[#F8FAFC] flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#1E293B]">نسخ احتياطي (JSON)</p>
              <p className="text-xs text-[#64748B]">حفظ ملف آمن يحتوي على كافة العمليات، الملاحظات، والإعدادات</p>
            </div>
          </div>
          <span className="text-xs text-[#3B82F6] font-bold bg-[#EFF6FF] border border-blue-100 px-3 py-1.5 rounded-xl">تحميل</span>
        </button>

        <label className="w-full text-right p-4 md:p-5 hover:bg-[#F8FAFC] flex items-center justify-between transition-colors cursor-pointer">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#1E293B]">استيراد نسخة احتياطية (JSON)</p>
              <p className="text-xs text-[#64748B]">استعادة العمليات، الملاحظات، والأرصدة من ملف سابق</p>
            </div>
          </div>
          <span className="text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">استيراد</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={onExportCSV}
          className="w-full text-right p-4 md:p-5 hover:bg-[#F8FAFC] flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#1E293B]">تصدير ملف إكسيل (CSV)</p>
              <p className="text-xs text-[#64748B]">تحميل جدول العمليات لفتحه ببرنامج Microsoft Excel</p>
            </div>
          </div>
          <span className="text-xs text-[#166534] font-bold bg-[#DCFCE7] border border-emerald-200 px-3 py-1.5 rounded-xl">Excel</span>
        </button>
      </div>

      {/* Sync Readiness Info Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm text-xs text-[#64748B] space-y-2">
        <div className="flex items-center gap-2 font-bold text-[#1E293B] text-sm">
          <Layers className="w-4 h-4 text-[#3B82F6]" />
          <span>التخزين المحلي والأوفلاين التام:</span>
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">
          يعمل التطبيق في وضع الأوفلاين الكامل (Full Offline Mode) عبر التخزين المحلي LocalStorage بدون الحاجة لأي مزامنة سحابية أو اتصال بالإنترنت.
        </p>
      </div>

      {/* Danger Zone: Reset Database */}
      <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#EF4444] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#EF4444]">مسح جميع البيانات</p>
              <p className="text-xs text-[#64748B]">حذف كافة العمليات والملاحظات وإعادة التطبيق لحالة البداية</p>
            </div>
          </div>
          <button
            onClick={onResetApp}
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#EF4444] text-xs font-bold border border-red-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح شامل</span>
          </button>
        </div>
      </div>

      {/* App Version Info */}
      <div className="p-2 text-center text-[#64748B] text-xs space-y-0.5">
        <p className="font-semibold text-slate-600">تطبيق "العهدة والمصاريف" PWA الإصدار 1.0.0</p>
        <p className="text-[11px]">يعمل بالكامل دون إنترنت (Full Offline Mode) • تخزين محلي مباشر عبر LocalStorage</p>
      </div>
    </div>
  );
};
