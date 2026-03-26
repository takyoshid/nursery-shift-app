import React, { useState, useRef, useEffect } from 'react';
import type { ShiftType } from '../types';

interface Props {
  shiftType: ShiftType;
  onChange: (newShift: ShiftType) => void;
  isWeekend: boolean;
  isSunday: boolean;
}

const SHIFT_TYPES: ShiftType[] = ['早番', '遅番', '日勤', '休み', '有休', ''];

const SHIFT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  早番: { bg: 'bg-blue-100', text: 'text-blue-700', label: '早番' },
  遅番: { bg: 'bg-orange-100', text: 'text-orange-700', label: '遅番' },
  日勤: { bg: 'bg-green-100', text: 'text-green-700', label: '日勤' },
  休み: { bg: 'bg-gray-100', text: 'text-gray-500', label: '休み' },
  有休: { bg: 'bg-purple-100', text: 'text-purple-700', label: '有休' },
  '': { bg: 'bg-white', text: 'text-transparent', label: '　' },
};

const ShiftCell: React.FC<Props> = ({ shiftType, onChange, isWeekend, isSunday }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const style = SHIFT_STYLES[shiftType] ?? SHIFT_STYLES[''];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const baseBg = isSunday ? 'bg-red-50' : isWeekend ? 'bg-orange-50' : '';

  return (
    <div ref={ref} className="relative flex items-center justify-center h-full">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full h-8 rounded-md text-xs font-medium transition cursor-pointer
          ${shiftType ? `${style.bg} ${style.text}` : `${baseBg} hover:bg-gray-100 text-gray-300`}
        `}
        title={shiftType || 'クリックで設定'}
      >
        {shiftType || '・'}
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[80px]">
          {SHIFT_TYPES.map((s) => {
            const st = SHIFT_STYLES[s];
            return (
              <button
                key={s === '' ? 'empty' : s}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left hover:opacity-80 transition flex items-center gap-2
                  ${s === shiftType ? 'font-bold' : ''}
                  ${s ? `${st.bg} ${st.text}` : 'text-gray-400 bg-white hover:bg-gray-50'}
                `}
              >
                {s === '' ? '（空白）' : s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShiftCell;
