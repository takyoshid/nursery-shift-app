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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      inputRef.current?.focus();
    }
  }, [editing, value]);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  const baseBg = isSunday ? 'bg-red-50/60' : isWeekend ? 'bg-blue-50/40' : 'bg-white';

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        className={`w-full h-8 px-1 text-[10px] border border-pink-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400 ${baseBg}`}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      title="クリックで編集"
      className={`w-full h-8 px-1 flex items-center text-[10px] rounded cursor-pointer truncate
        ${value ? 'text-gray-700 font-medium' : 'text-gray-300'}
        ${baseBg} hover:bg-pink-50
        ${isToday ? 'ring-1 ring-inset ring-yellow-400' : ''}
      `}
    >
      {value || '・'}
    </div>
  );
};

export default NoteCell;
