import React from 'react';
import { Home, ListOrdered, StickyNote, PieChart, Settings } from 'lucide-react';
import type { ActiveTab } from '../types';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  transactionCount?: number;
  notesCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab,
  transactionCount,
  notesCount
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'الرئيسية', icon: Home },
    { id: 'transactions' as ActiveTab, label: 'العمليات', icon: ListOrdered, badge: transactionCount },
    { id: 'notes' as ActiveTab, label: 'ملاحظات', icon: StickyNote, badge: notesCount },
    { id: 'reports' as ActiveTab, label: 'تقارير', icon: PieChart },
    { id: 'settings' as ActiveTab, label: 'إعدادات', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] z-40 safe-nav-bottom shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1.5 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`relative py-2 px-0.5 flex flex-col items-center justify-center transition-all cursor-pointer select-none rounded-2xl active:scale-95 ${
                isActive
                  ? 'text-[#1E293B] font-bold'
                  : 'text-[#64748B] hover:text-[#1E293B] font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-6 h-1 bg-[#10B981] rounded-full" />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#1E293B]' : 'text-[#64748B]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#0F172A] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] mt-1 tracking-tight truncate ${isActive ? 'font-bold text-[#1E293B]' : 'text-[#64748B]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

