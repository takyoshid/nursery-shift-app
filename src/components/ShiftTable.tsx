import React, { useMemo } from 'react';
import type { Staff, ShiftEntry, ShiftType, StaffGroup } from '../types';
import { GROUP_STYLES } from '../types';
import ShiftCell from './ShiftCell';
import NoteCell from './NoteCell';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  staffList: Staff[];
  shifts: ShiftEntry[];
  events: Record<string, string>;
  training: Record<string, string>;
  onShiftChange: (staffId: string, date: string, shiftType: ShiftType) => void;
  onNoteChange: (type: 'events' | 'training', date: string, value: string) => void;
}

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
const DOW_COLORS = [
  'text-red-500', // 日
  'text-gray-700', // 月
  'text-gray-700', // 火
  'text-gray-700', // 水
  'text-gray-700', // 木
  'text-gray-700', // 金
  'text-blue-500', // 土
];

function getDaysInMonth(year: number, month: number): Date[] {
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => new Date(year, month, i + 1));
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function countWorkDays(staffId: string, shifts: ShiftEntry[], dates: Date[]): number {
  const dateSet = new Set(dates.map(formatDate));
  return shifts.filter(
    (s) =>
      s.staffId === staffId &&
      dateSet.has(s.date) &&
      s.shiftType !== '' &&
      s.shiftType !== '休み' &&
      s.shiftType !== '有休'
  ).length;
}

const ShiftTable: React.FC<Props> = ({ staffList, shifts, events, training, onShiftChange, onNoteChange }) => {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth());

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const shiftMap = useMemo(() => {
    const map: Record<string, Record<string, ShiftType>> = {};
    for (const entry of shifts) {
      if (!map[entry.staffId]) map[entry.staffId] = {};
      map[entry.staffId][entry.date] = entry.shiftType;
    }
    return map;
  }, [shifts]);

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const handleExport = () => {
    exportToExcel(staffList, shifts, year, month);
  };

  const today = formatDate(new Date());

  return (
    <div className="p-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 transition font-bold"
          >
            ‹
          </button>
          <h2 className="text-xl font-bold text-pink-800 min-w-[140px] text-center">
            {year}年 {month + 1}月
          </h2>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 transition font-bold"
          >
            ›
          </button>
        </div>

        <div className="flex gap-2 items-center">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            {[
              { label: '早番', bg: 'bg-blue-100 text-blue-700' },
              { label: '遅番', bg: 'bg-orange-100 text-orange-700' },
              { label: '日勤', bg: 'bg-green-100 text-green-700' },
              { label: '休み', bg: 'bg-gray-100 text-gray-500' },
              { label: '有休', bg: 'bg-purple-100 text-purple-700' },
            ].map((item) => (
              <span key={item.label} className={`px-2 py-0.5 rounded-full ${item.bg}`}>
                {item.label}
              </span>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={staffList.length === 0}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <span>📊</span> Excel出力
          </button>
        </div>
      </div>

      {staffList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-16 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm">スタッフが登録されていません</p>
          <p className="text-gray-400 text-xs mt-1">「スタッフ管理」タブからスタッフを追加してください</p>
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-pink-100 shadow-sm">
          <table className="border-collapse text-xs" style={{ minWidth: `${180 + days.length * 48 + 60}px` }}>
            <thead>
              <tr className="bg-pink-50">
                {/* Staff name column header */}
                <th
                  className="sticky left-0 z-20 bg-pink-50 border-b border-r border-pink-200 px-3 py-2 text-left font-medium text-pink-700 min-w-[120px]"
                  rowSpan={2}
                >
                  スタッフ名
                </th>
                {/* Day numbers */}
                {days.map((d) => {
                  const dow = d.getDay();
                  const isSunday = dow === 0;
                  const isSaturday = dow === 6;
                  const dateStr = formatDate(d);
                  const isToday = dateStr === today;
                  return (
                    <th
                      key={d.getDate()}
                      className={`border-b border-r border-pink-100 text-center py-1 font-medium w-12
                        ${isSunday ? 'bg-red-50 text-red-500' : isSaturday ? 'bg-blue-50 text-blue-500' : 'text-gray-600'}
                        ${isToday ? 'ring-2 ring-inset ring-yellow-400' : ''}
                      `}
                    >
                      {d.getDate()}
                    </th>
                  );
                })}
                <th
                  className="sticky right-0 z-20 bg-pink-50 border-b border-l border-pink-200 px-2 py-2 text-center font-medium text-pink-700 min-w-[56px]"
                  rowSpan={2}
                >
                  出勤<br />日数
                </th>
              </tr>
              <tr className="bg-pink-50">
                {days.map((d) => {
                  const dow = d.getDay();
                  const isSunday = dow === 0;
                  const isSaturday = dow === 6;
                  return (
                    <th
                      key={`dow-${d.getDate()}`}
                      className={`border-b border-r border-pink-100 text-center py-1 font-normal w-12
                        ${isSunday ? 'bg-red-50' : isSaturday ? 'bg-blue-50' : ''}
                        ${DOW_COLORS[dow]}
                      `}
                    >
                      {DOW_LABELS[dow]}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* 行事予定・地域研修 行 */}
              {(
                [
                  { key: 'events' as const, label: '行事予定', bg: 'bg-rose-50', text: 'text-rose-700', headerBg: 'bg-rose-100' },
                  { key: 'training' as const, label: '地域・研修等', bg: 'bg-teal-50', text: 'text-teal-700', headerBg: 'bg-teal-100' },
                ] as const
              ).map(({ key, label, bg, text, headerBg }) => (
                <tr key={key} className={bg}>
                  <td className={`sticky left-0 z-10 border-b border-r border-pink-100 px-3 py-1 text-xs font-bold min-w-[120px] ${headerBg} ${text}`}>
                    {label}
                  </td>
                  {days.map((d) => {
                    const dateStr = formatDate(d);
                    const dow = d.getDay();
                    return (
                      <td key={dateStr} className="border-b border-r border-pink-100 p-0.5 w-12">
                        <NoteCell
                          value={key === 'events' ? (events[dateStr] ?? '') : (training[dateStr] ?? '')}
                          onChange={(v) => onNoteChange(key, dateStr, v)}
                          isWeekend={dow === 6}
                          isSunday={dow === 0}
                          isToday={dateStr === today}
                        />
                      </td>
                    );
                  })}
                  <td className={`sticky right-0 z-10 border-b border-l border-pink-100 min-w-[56px] ${headerBg}`} />
                </tr>
              ))}

              {staffList.map((staff, sIdx) => {
                const staffShifts = shiftMap[staff.id] ?? {};
                const workDays = countWorkDays(staff.id, shifts, days);
                const prevStaff = staffList[sIdx - 1];
                const isGroupStart = sIdx === 0 || prevStaff?.group !== staff.group;
                const gs = GROUP_STYLES[staff.group as StaffGroup] ?? GROUP_STYLES['その他'];
                return (
                  <React.Fragment key={staff.id}>
                    {/* Group header row */}
                    {isGroupStart && (
                      <tr>
                        <td
                          colSpan={days.length + 2}
                          className={`sticky left-0 px-3 py-1 text-xs font-bold tracking-wide border-b border-t border-pink-100 ${gs.headerBg} ${gs.headerText}`}
                        >
                          ▍{staff.group}
                        </td>
                      </tr>
                    )}
                    {/* Staff row */}
                    <tr className={`${gs.bg} hover:brightness-95 transition`}>
                      {/* Staff name */}
                      <td
                        className={`sticky left-0 z-10 border-b border-r border-pink-100 px-3 py-1.5 font-medium min-w-[120px] ${gs.bg} ${gs.text}`}
                      >
                        <div>{staff.name}</div>
                        <div className="text-[10px] opacity-60">{staff.role}</div>
                      </td>

                      {/* Shift cells */}
                      {days.map((d) => {
                        const dateStr = formatDate(d);
                        const dow = d.getDay();
                        const isSunday = dow === 0;
                        const isSaturday = dow === 6;
                        const shiftType = staffShifts[dateStr] ?? '';
                        const isToday = dateStr === today;
                        return (
                          <td
                            key={dateStr}
                            className={`border-b border-r border-pink-100 p-0.5 w-12
                              ${isSunday ? 'bg-red-50/60' : isSaturday ? 'bg-blue-50/40' : ''}
                              ${isToday ? 'ring-1 ring-inset ring-yellow-400' : ''}
                            `}
                          >
                            <ShiftCell
                              shiftType={shiftType}
                              onChange={(newShift) => onShiftChange(staff.id, dateStr, newShift)}
                              isWeekend={isSaturday}
                              isSunday={isSunday}
                            />
                          </td>
                        );
                      })}

                      {/* Work days count */}
                      <td
                        className={`sticky right-0 z-10 border-b border-l border-pink-100 text-center font-bold min-w-[56px] ${gs.bg}
                          ${workDays >= 20 ? 'text-pink-600' : 'text-gray-600'}
                        `}
                      >
                        {workDays}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile legend */}
      <div className="mt-4 flex md:hidden flex-wrap items-center gap-2 text-xs">
        {[
          { label: '早番', bg: 'bg-blue-100 text-blue-700' },
          { label: '遅番', bg: 'bg-orange-100 text-orange-700' },
          { label: '日勤', bg: 'bg-green-100 text-green-700' },
          { label: '休み', bg: 'bg-gray-100 text-gray-500' },
          { label: '有休', bg: 'bg-purple-100 text-purple-700' },
        ].map((item) => (
          <span key={item.label} className={`px-2 py-0.5 rounded-full ${item.bg}`}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ShiftTable;
