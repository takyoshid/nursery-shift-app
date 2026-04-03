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
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [editing, value]);

  // 編集エリア外クリックで閉じる
  useEffect(() => {
    if (!editing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        commit();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editing, draft]);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  const baseBg = isSunday ? 'bg-red-50' : isWeekend ? 'bg-blue-50' : 'bg-white';

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      {/* 縦書き表示エリア */}
      <div
        onClick={() => setEditing(true)}
        title="クリックで編集"
        className={`w-full min-h-8 flex items-start justify-center py-1 cursor-pointer text-[10px]
          ${value ? 'text-gray-700 font-medium' : 'text-gray-300'}
          ${baseBg} hover:bg-pink-50
          ${isToday ? 'ring-1 ring-inset ring-yellow-400' : ''}
        `}
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        {value || '・'}
      </div>

      {/* 編集ポップアップ（横書き） */}
      {editing && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 bg-white border border-pink-300 rounded-lg shadow-lg p-1.5 w-36">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
              if (e.key === 'Escape') setEditing(false);
            }}
            rows={3}
            placeholder="Shift+Enterで改行"
            className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5 resize-none focus:outline-none focus:ring-1 focus:ring-pink-300 leading-4"
          />
          <div className="flex justify-end gap-1 mt-1">
            <button onClick={() => setEditing(false)} className="text-[10px] text-gray-400 hover:text-gray-600 px-1">取消</button>
            <button onClick={commit} className="text-[10px] bg-pink-500 text-white rounded px-2 py-0.5 hover:bg-pink-600">確定</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteCell;
