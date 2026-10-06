import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Clock, 
  Tag, 
  X, 
  StickyNote,
  AlertCircle
} from 'lucide-react';
import type { Note, NoteCategory } from '../types';

interface NotesViewProps {
  notes: Note[];
  onSaveNote: (note: {
    id?: string;
    title: string;
    content: string;
    category: NoteCategory;
    color?: string;
    isPinned?: boolean;
    reminderDate?: string;
  }) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onTogglePin: (id: string) => Promise<void>;
}

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  slate: { bg: 'bg-white', border: 'border-[#E2E8F0]', badge: 'bg-[#F1F5F9] text-[#475569]', text: 'text-[#1E293B]' },
  blue: { bg: 'bg-[#F0F7FF]', border: 'border-[#BFDBFE]', badge: 'bg-[#DBEAFE] text-[#1E40AF]', text: 'text-[#1E3A8A]' },
  emerald: { bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', badge: 'bg-[#DCFCE7] text-[#166534]', text: 'text-[#14532D]' },
  amber: { bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', badge: 'bg-[#FEF3C7] text-[#92400E]', text: 'text-[#78350F]' },
  rose: { bg: 'bg-[#FFF1F2]', border: 'border-[#FECDD3]', badge: 'bg-[#FFE4E6] text-[#9F1239]', text: 'text-[#881337]' },
  purple: { bg: 'bg-[#FAF5FF]', border: 'border-[#E9D5FF]', badge: 'bg-[#F3E8FF] text-[#6B21A8]', text: 'text-[#581C87]' },
};

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  onTogglePin
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | NoteCategory>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('general');
  const [color, setColor] = useState('slate');
  const [isPinned, setIsPinned] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('general');
    setColor('slate');
    setIsPinned(false);
    setReminderDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setColor(note.color || 'slate');
    setIsPinned(note.isPinned || false);
    setReminderDate(note.reminderDate || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    try {
      setIsSubmitting(true);
      await onSaveNote({
        id: editingNote ? editingNote.id : undefined,
        title: title.trim() || 'بدون عنوان',
        content: content.trim(),
        category,
        color,
        isPinned,
        reminderDate: reminderDate || undefined
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (note: Note) => {
    const text = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredNotes = useMemo(() => {
    let list = [...notes];

    if (activeCategory !== 'all') {
      list = list.filter(n => n.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        n =>
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q) ||
          n.date?.includes(q)
      );
    }

    return list;
  }, [notes, activeCategory, searchQuery]);

  const getCategoryLabel = (cat: NoteCategory) => {
    switch (cat) {
      case 'work': return '💼 عهدة وشغل';
      case 'personal': return '👤 شخصي';
      case 'reminder': return '⏰ تذكير';
      default: return '📝 عام';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-[#1E293B] rounded-3xl p-6 text-white shadow-sm border border-[#334155]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
              <StickyNote className="w-4 h-4 text-[#10B981]" />
              <span>دفتر الملاحظات والتذكيرات</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              الملاحظات والمهام ({notes.length})
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              تدوين فوري وحفظ محلي آمن 100% بدون إنترنت
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>تدوين ملاحظة جديدة</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="bg-white p-3.5 rounded-3xl shadow-sm border border-[#E2E8F0] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#64748B] shrink-0 mr-1" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الملاحظات، العناوين، المحتوى..."
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

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#1E293B] text-white border border-[#1E293B] shadow-xs font-bold'
                : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
            }`}
          >
            الكل ({notes.length})
          </button>
          <button
            onClick={() => setActiveCategory('work')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeCategory === 'work'
                ? 'bg-[#1E293B] text-white border border-[#1E293B] shadow-xs font-bold'
                : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
            }`}
          >
            💼 عهدة وشغل
          </button>
          <button
            onClick={() => setActiveCategory('personal')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeCategory === 'personal'
                ? 'bg-[#1E293B] text-white border border-[#1E293B] shadow-xs font-bold'
                : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
            }`}
          >
            👤 شخصي
          </button>
          <button
            onClick={() => setActiveCategory('reminder')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeCategory === 'reminder'
                ? 'bg-[#1E293B] text-white border border-[#1E293B] shadow-xs font-bold'
                : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
            }`}
          >
            ⏰ تذكيرات
          </button>
          <button
            onClick={() => setActiveCategory('general')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeCategory === 'general'
                ? 'bg-[#1E293B] text-white border border-[#1E293B] shadow-xs font-bold'
                : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
            }`}
          >
            📝 عام
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center mx-auto">
            <StickyNote className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-[#1E293B]">
            {searchQuery ? 'لم يتم العثور على ملاحظات مطابقة' : 'لا توجد ملاحظات مسجلة بعد'}
          </h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            {searchQuery
              ? 'جرّب البحث بكلمة أخرى أو تغيير التصفية.'
              : 'سجل هنا فواتير معلقة، أفكار، تذكيرات استحقاق للعهدة، أو ملاحظات يومية خاصة بك.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openAddModal}
              className="mt-2 inline-flex items-center gap-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أول ملاحظة</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const style = COLOR_MAP[note.color || 'slate'] || COLOR_MAP.slate;

            return (
              <div
                key={note.id}
                className={`${style.bg} ${style.border} border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group`}
              >
                <div>
                  {/* Top Note Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${style.badge}`}>
                        {getCategoryLabel(note.category)}
                      </span>
                      {note.isPinned && (
                        <span className="text-[10px] font-extrabold bg-[#0F172A] text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <Pin className="w-3 h-3 fill-current" />
                          <span>مثبتة</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onTogglePin(note.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          note.isPinned
                            ? 'text-[#0F172A] bg-slate-200/60'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
                        }`}
                        title={note.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => openEditModal(note)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
                        title="تعديل الملاحظة"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('هل تريد حذف هذه الملاحظة؟')) {
                            onDeleteNote(note.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
                        title="حذف الملاحظة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`font-black text-base ${style.text} mb-2 leading-snug`}>
                    {note.title}
                  </h3>

                  {/* Content */}
                  <p className="text-xs text-[#334155] whitespace-pre-wrap leading-relaxed font-medium mb-4 break-words">
                    {note.content}
                  </p>
                </div>

                {/* Bottom Card Meta & Copy */}
                <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#94A3B8]" />
                      <span>{note.date}</span>
                    </span>
                    {note.reminderDate && (
                      <span className="text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        تذكير: {note.reminderDate}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopy(note)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#475569] hover:text-[#0F172A] px-2 py-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    {copiedId === note.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 shadow-2xl border border-[#E2E8F0] animate-in slide-in-from-bottom-6 duration-200 safe-bottom">
            <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
                  <StickyNote className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#1E293B]">
                    {editingNote ? 'تعديل الملاحظة' : 'تدوين ملاحظة جديدة'}
                  </h2>
                  <p className="text-xs text-[#64748B]">تُحفظ محلياً على جهازك دون إنترنت</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1.5">عنوان الملاحظة</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: فواتير بنزين معلقة، استحقاق مورد، فكرة..."
                  autoFocus
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:bg-white focus:border-[#3B82F6] p-3 rounded-2xl text-sm font-bold text-[#1E293B] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1.5">نص وتفاصيل الملاحظة</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب تفاصيل الملاحظة أو التذكير هنا..."
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:bg-white focus:border-[#3B82F6] p-3 rounded-2xl text-sm font-medium text-[#1E293B] outline-none transition-all resize-none"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1.5">تصنيف الملاحظة</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'general', label: '📝 عام' },
                    { id: 'work', label: '💼 شغل' },
                    { id: 'personal', label: '👤 شخصي' },
                    { id: 'reminder', label: '⏰ تذكير' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as NoteCategory)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        category === cat.id
                          ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1.5">لون البطاقة</label>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'slate', bg: 'bg-slate-200 border-slate-400' },
                    { id: 'blue', bg: 'bg-blue-300 border-blue-500' },
                    { id: 'emerald', bg: 'bg-emerald-300 border-emerald-500' },
                    { id: 'amber', bg: 'bg-amber-300 border-amber-500' },
                    { id: 'rose', bg: 'bg-rose-300 border-rose-500' },
                    { id: 'purple', bg: 'bg-purple-300 border-purple-500' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={`w-7 h-7 rounded-full ${c.bg} border-2 transition-transform cursor-pointer ${
                        color === c.id ? 'scale-125 ring-2 ring-[#0F172A] ring-offset-2' : 'hover:scale-110 opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Pin & Reminder Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0F172A] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5" />
                    <span>تثبيت في الأعلى</span>
                  </span>
                </label>

                <div>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    placeholder="تاريخ التذكير"
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:bg-white focus:border-[#3B82F6] p-2.5 rounded-2xl text-xs font-semibold text-[#1E293B] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl font-bold text-base bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5 text-[#10B981]" />
                  <span>{isSubmitting ? 'جارٍ الحفظ...' : editingNote ? 'حفظ التعديلات' : 'حفظ الملاحظة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
