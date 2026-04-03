import React, { useMemo, useState } from 'react';
import type { Staff, ShiftEntry, ShiftType } from '../types';
import { GROUP_STYLES, type StaffGroup } from '../types';

interface Props {
  staffList: Staff[];
  shifts: ShiftEntry[];
  leaveRequests: Record<string, string[]>;
  onLeaveToggle: (staffId: string, date: string) => void;
  onApply: (month: { year: number; month: number }) => void;
  onReset: (month: { year: number; month: number }) => void;
}

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

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

const LeaveRequests: React.FC<Props> = ({
  staffList, shifts, leaveRequests, onLeaveToggle, onApply, onReset,
}) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [applied, setApplied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const today = formatDate(now);

  // 既存シフトマップ
  const shiftMap = useMemo(() => {
    const map: Record<string, Record<string, ShiftType>> = {};
    for (const s of shifts) {
      if (!map[s.staffId]) map[s.staffId] = {};
      map[s.staffId][s.date] = s.shiftType;
    }
    return map;
  }, [shifts]);

  const prevMonth = () => {
    setApplied(false);
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    setApplied(false);
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  // この月の希望日数カウント
  const countRequests = (staffId: string) => {
    const dates = leaveRequests[staffId] ?? [];
    return dates.filter(d => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length;
  };

  const handleApply = () => {
    onApply({ year, month });
    setApplied(true);
  };

  const handleReset = () => {
    onReset({ year, month });
    setConfirmReset(false);
    setApplied(false);
  };

  // 希望合計件数（今月）
  const totalRequests = staffList.reduce((sum, s) => sum + countRequests(s.id), 0);

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 transition font-bold">‹</button>
          <h2 className="text-xl font-bold text-pink-800 min-w-[140px] text-center">{year}年 {month + 1}月</h2>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 transition font-bold">›</button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">今月の希望: 計 <strong>{totalRequests}</strong> 件</span>

          {/* リセットボタン */}
          {confirmReset ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-red-500 font-medium">今月の希望を全削除？</span>
              <button onClick={handleReset} className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1.5 rounded-lg transition">削除</button>
              <button onClick={() => setConfirmReset(false)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1.5 rounded-lg transition">取消</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              disabled={totalRequests === 0}
              className="px-3 py-2 rounded-lg text-sm font-medium transition bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              🗑 リセット
            </button>
          )}

          <button
            onClick={handleApply}
            disabled={totalRequests === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2
              ${applied
                ? 'bg-gray-200 text-gray-500 cursor-default'
                : 'bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white'
              }`}
          >
            {applied ? '✓ 反映済み' : '🔄 希望を反映'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">セルをクリックして希望日を登録。既にシフトが入っている日は灰色表示。</p>

      {staffList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center text-gray-400 text-sm">
          スタッフが登録されていません
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-pink-100 shadow-sm">
          <table className="border-collapse text-xs" style={{ minWidth: `${180 + days.length * 44 + 60}px` }}>
            <thead>
              <tr className="bg-pink-50">
                <th className="sticky left-0 z-20 bg-pink-50 border-b border-r border-pink-200 px-3 py-2 text-left font-medium text-pink-700 min-w-[120px]" rowSpan={2}>
                  スタッフ名
                </th>
                {days.map((d) => {
                  const dow = d.getDay();
                  const dateStr = formatDate(d);
                  const isToday = dateStr === today;
                  return (
                    <th key={d.getDate()}
                      className={`border-b border-r border-pink-100 text-center py-1 font-medium w-11
                        ${dow === 0 ? 'bg-red-50 text-red-500' : dow === 6 ? 'bg-blue-50 text-blue-500' : 'text-gray-600'}
                        ${isToday ? 'ring-2 ring-inset ring-yellow-400' : ''}
                      `}
                    >
                      {d.getDate()}
                    </th>
                  );
                })}
                <th className="sticky right-0 z-20 bg-pink-50 border-b border-l border-pink-200 px-2 py-2 text-center font-medium text-pink-700 min-w-[52px]" rowSpan={2}>
                  希望<br />日数
                </th>
              </tr>
              <tr className="bg-pink-50">
                {days.map((d) => {
                  const dow = d.getDay();
                  return (
                    <th key={`dow-${d.getDate()}`}
                      className={`border-b border-r border-pink-100 text-center py-0.5 font-normal w-11
                        ${dow === 0 ? 'bg-red-50 text-red-500' : dow === 6 ? 'bg-blue-50 text-blue-500' : 'text-gray-500'}
                      `}
                    >
                      {DOW_LABELS[dow]}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff, sIdx) => {
                const gs = GROUP_STYLES[staff.group as StaffGroup] ?? GROUP_STYLES['その他'];
                const prevStaff = staffList[sIdx - 1];
                const isGroupStart = sIdx === 0 || prevStaff?.group !== staff.group;
                const requests = new Set(leaveRequests[staff.id] ?? []);
                const reqCount = countRequests(staff.id);

                return (
                  <React.Fragment key={staff.id}>
                    {isGroupStart && (
                      <tr>
                        <td colSpan={days.length + 2}
                          className={`sticky left-0 px-3 py-1 text-xs font-bold tracking-wide border-b border-t border-pink-100 ${gs.headerBg} ${gs.headerText}`}
                        >
                          ▍{staff.group}
                        </td>
                      </tr>
                    )}
                    <tr className={`${gs.bg} hover:brightness-95 transition`}>
                      <td className={`sticky left-0 z-10 border-b border-r border-pink-100 px-3 py-1.5 font-medium min-w-[120px] ${gs.bg} ${gs.text}`}>
                        {staff.name}
                      </td>
                      {days.map((d) => {
                        const dateStr = formatDate(d);
                        const dow = d.getDay();
                        const isRequested = requests.has(dateStr);
                        const existingShift = shiftMap[staff.id]?.[dateStr];
                        const hasShift = !!existingShift;
                        return (
                          <td key={dateStr}
                            className={`border-b border-r border-pink-100 w-11 p-0
                              ${dow === 0 ? 'bg-red-50/40' : dow === 6 ? 'bg-blue-50/30' : ''}
                            `}
                          >
                            <button
                              onClick={() => onLeaveToggle(staff.id, dateStr)}
                              title={hasShift ? `既存シフト: ${existingShift}` : isRequested ? '希望あり（クリックで解除）' : '希望なし（クリックで登録）'}
                              className={`w-full h-8 flex items-center justify-center rounded transition text-[11px] font-bold
                                ${isRequested
                                  ? 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300'
                                  : hasShift
                                  ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                  : 'hover:bg-indigo-50 text-transparent hover:text-indigo-200'
                                }
                              `}
                            >
                              {isRequested ? '希' : hasShift ? existingShift : '・'}
                            </button>
                          </td>
                        );
                      })}
                      <td className={`sticky right-0 z-10 border-b border-l border-pink-100 text-center font-bold min-w-[52px] ${gs.bg}
                        ${reqCount > 0 ? 'text-indigo-600' : 'text-gray-300'}
                      `}>
                        {reqCount > 0 ? reqCount : '—'}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
