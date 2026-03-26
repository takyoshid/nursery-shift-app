import React, { useState, useRef, useEffect } from 'react';
import type { ShiftType } from '../types';

interface Props {
  shiftType: ShiftType;
  onChange: (newShift: ShiftType) => void;
  isWeekend: boolean;
  isSunday: boolean;
}

const SHIFT_TYPES: ShiftType[] = ['A"', 'A', 'B"', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', '休み', '有休', ''];

const SHIFT_INFO: Record<string, { bg: string; text: string; time: string }> = {
  'A"': { bg: 'bg-blue-200',   text: 'text-blue-900',   time: '06:45~15:45' },
  'A':  { bg: 'bg-blue-100',   text: 'text-blue-800',   time: '07:00~16:00' },
  'B"': { bg: 'bg-cyan-200',   text: 'text-cyan-900',   time: '07:30~16:30' },
  'B':  { bg: 'bg-cyan-100',   text: 'text-cyan-800',   time: '08:00~17:00' },
  'C':  { bg: 'bg-green-100',  text: 'text-green-800',  time: '08:30~17:30' },
  'D':  { bg: 'bg-lime-100',   text: 'text-lime-800',   time: '09:00~18:00' },
  'E':  { bg: 'bg-yellow-100', text: 'text-yellow-800', time: '09:15~18:15' },
  'F':  { bg: 'bg-amber-100',  text: 'text-amber-800',  time: '09:30~18:30' },
  'G':  { bg: 'bg-orange-100', text: 'text-orange-800', time: '10:00~19:00' },
  'H':  { bg: 'bg-red-100',    text: 'text-red-800',    time: '11:00~20:00' },
  'I':  { bg: 'bg-rose-200',   text: 'text-rose-900',   time: '11:10~20:10' },
  '休み': { bg: 'bg-gray-100',   text: 'text-gray-500',   time: '休日' },
  '有休': { bg: 'bg-purple-100', text: 'text-purple-700', time: '有給休暇' },
  '':   { bg: 'bg-white',      text: 'text-transparent', time: '' },
};

const ShiftCell: React.FC<Props> = ({ shiftType, onChange, isWeekend, isSunday }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const style = SHIFT_INFO[shiftType] ?? SHIFT_INFO[''];

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
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[150px]">
          {SHIFT_TYPES.map((s) => {
            const st = SHIFT_INFO[s];
            return (
              <button
                key={s === '' ? 'empty' : s}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left hover:opacity-80 transition flex items-center justify-between gap-3
                  ${s === shiftType ? 'font-bold ring-1 ring-inset ring-gray-400' : ''}
                  ${s ? `${st.bg} ${st.text}` : 'text-gray-400 bg-white hover:bg-gray-50'}
                `}
              >
                <span className="font-semibold w-6">{s === '' ? '－' : s}</span>
                <span className="text-[10px] opacity-70">{s === '' ? '（空白）' : st.time}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShiftCell;
