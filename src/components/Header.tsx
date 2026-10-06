import React from 'react';
import { Wifi, WifiOff, Smartphone, RefreshCw } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
  isStandalone: boolean;
  swUpdateAvailable: boolean;
  onUpdateSw: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  isStandalone,
  swUpdateAvailable,
  onUpdateSw
}) => {
  return (
    <header className="bg-[#1E293B] text-white sticky top-0 z-40 shadow-lg safe-top">
      <div className="max-w-4xl mx-auto px-4 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center text-xl shadow-inner text-white">
            💰
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight leading-tight text-white">العهدة والمصاريف</h1>
            <p className="text-[11px] text-slate-300 font-medium">إدارة عهدة الشغل والمال الشخصي</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {swUpdateAvailable && (
            <button
              onClick={onUpdateSw}
              className="bg-amber-400 text-amber-950 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow animate-pulse text-[11px]"
              title="تحديث متاح"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>تحديث متوفر</span>
            </button>
          )}

          {isStandalone && (
            <span className="hidden sm:flex items-center gap-1 bg-[#334155] px-3 py-1 rounded-full text-[11px] border border-[#475569] text-slate-200">
              <Smartphone className="w-3 h-3 text-[#10B981]" />
              <span>تطبيق PWA</span>
            </span>
          )}

          <div className="bg-[#334155] px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-[#475569]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-[11px] font-medium text-slate-100">
              {isOnline ? 'متصل الآن - وضع الأوفلاين نشط ✅' : 'وضع الأوفلاين نشط'}
            </span>
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-[#10B981] mr-0.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-300 mr-0.5" title="العمل بدون إنترنت" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
