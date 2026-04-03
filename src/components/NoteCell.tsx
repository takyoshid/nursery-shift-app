import React, { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  isWeekend: boolean;
  isSunday: boolean;
  isToday: boolean;
}

const NoteCell: React.FC<Props> = ({ value, onChange, isWeekend, isSunday, isToday }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.selectionStart = el.value.length;
      }
    }
  }, [editing, value]);

  // テキストエリアの高さを内容に合わせて自動調整
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [draft]);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  const baseBg = isSunday ? 'bg-red-50/60' : isWeekend ? 'bg-blue-50/40' : 'bg-white';
  const lineCount = value ? value.split('\n').length : 0;

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          // Shift+Enter で改行、Enter だけは保存
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commit();
          }
          if (e.key === 'Escape') setEditing(false);
        }}
        rows={Math.max(2, draft.split('\n').length)}
        className={`w-full min-h-8 px-1 py-0.5 text-[10px] border border-pink-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400 resize-none overflow-hidden leading-4 ${baseBg}`}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      title="クリックで編集（Shift+Enterで改行）"
      className={`w-full min-h-8 px-1 py-0.5 text-[10px] rounded cursor-pointer leading-4
        ${value ? 'text-gray-700 font-medium whitespace-pre-wrap break-words' : 'text-gray-300 flex items-center'}
        ${baseBg} hover:bg-pink-50
        ${isToday ? 'ring-1 ring-inset ring-yellow-400' : ''}
      `}
    >
      {value || '・'}
      {lineCount > 1 && (
        <span className="block text-[9px] text-gray-400 mt-0.5">{lineCount}行</span>
      )}
    </div>
  );
};

export default NoteCell;
