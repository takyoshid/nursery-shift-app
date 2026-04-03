import React, { useState, useCallback } from 'react';
import type { Staff, ShiftEntry, ShiftType, AppData } from './types';
import { loadData, saveData } from './utils/storage';
import StaffManager from './components/StaffManager';
import ShiftTable from './components/ShiftTable';
import LeaveRequests from './components/LeaveRequests';
import Settings from './components/Settings';
import './index.css';

type View = 'shift' | 'leave' | 'staff' | 'settings';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => loadData());
  const [view, setView] = useState<View>('shift');

  const persist = useCallback((newData: AppData) => {
    setData(newData);
    saveData(newData);
  }, []);

  const handleReset = useCallback(() => {
    localStorage.removeItem('nursery-shift-app-data');
    setData(loadData());
    setView('shift');
  }, []);

  // Staff handlers
  const handleAddStaff = useCallback(
    (staff: Omit<Staff, 'id'>) => {
      const newStaff: Staff = { ...staff, id: generateId() };
      persist({ ...data, staffList: [...data.staffList, newStaff] });
    },
    [data, persist]
  );

  const handleEditStaff = useCallback(
    (updated: Staff) => {
      const staffList = data.staffList.map((s) => (s.id === updated.id ? updated : s));
      persist({ ...data, staffList });
    },
    [data, persist]
  );

  const handleDeleteStaff = useCallback(
    (id: string) => {
      const staffList = data.staffList.filter((s) => s.id !== id);
      const shifts = data.shifts.filter((s) => s.staffId !== id);
      persist({ ...data, staffList, shifts });
    },
    [data, persist]
  );

  // Note handlers
  const handleNoteChange = useCallback(
    (type: 'events' | 'training', date: string, value: string) => {
      persist({ ...data, [type]: { ...data[type], [date]: value } });
    },
    [data, persist]
  );

  // Leave request handlers
  const handleLeaveToggle = useCallback(
    (staffId: string, date: string) => {
      const current = data.leaveRequests[staffId] ?? [];
      const updated = current.includes(date)
        ? current.filter((d) => d !== date)
        : [...current, date];
      persist({ ...data, leaveRequests: { ...data.leaveRequests, [staffId]: updated } });
    },
    [data, persist]
  );

  const handleLeaveReset = useCallback(
    ({ year, month }: { year: number; month: number }) => {
      const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
      const leaveRequests = Object.fromEntries(
        Object.entries(data.leaveRequests).map(([id, dates]) => [
          id,
          dates.filter((d) => !d.startsWith(prefix)),
        ])
      );
      persist({ ...data, leaveRequests });
    },
    [data, persist]
  );

  const handleApplyLeave = useCallback(
    ({ year, month }: { year: number; month: number }) => {
      const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
      let shifts = [...data.shifts];
      for (const [staffId, dates] of Object.entries(data.leaveRequests)) {
        for (const date of dates) {
          if (!date.startsWith(prefix)) continue;
          const idx = shifts.findIndex((s) => s.staffId === staffId && s.date === date);
          if (idx >= 0) {
            shifts[idx] = { ...shifts[idx], shiftType: '休み' };
          } else {
            shifts.push({ staffId, date, shiftType: '休み' });
          }
        }
      }
      persist({ ...data, shifts });
    },
    [data, persist]
  );

  const handleEventsImport = useCallback(
    (imported: Record<string, string>) => {
      // 既存データとマージ（同じ日付は改行で結合）
      const merged = { ...data.events };
      for (const [date, name] of Object.entries(imported)) {
        merged[date] = merged[date] ? `${merged[date]}\n${name}` : name;
      }
      persist({ ...data, events: merged });
    },
    [data, persist]
  );

  // Shift handlers
  const handleShiftChange = useCallback(
    (staffId: string, date: string, shiftType: ShiftType) => {
      const existing = data.shifts.findIndex(
        (s) => s.staffId === staffId && s.date === date
      );
      let shifts: ShiftEntry[];
      if (shiftType === '') {
        shifts = data.shifts.filter((s) => !(s.staffId === staffId && s.date === date));
      } else if (existing >= 0) {
        shifts = data.shifts.map((s, i) =>
          i === existing ? { ...s, shiftType } : s
        );
      } else {
        shifts = [...data.shifts, { staffId, date, shiftType }];
      }
      persist({ ...data, shifts });
    },
    [data, persist]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌸</span>
            <div>
              <h1 className="text-lg font-bold text-pink-800 leading-tight">保育園シフト管理</h1>
              <p className="text-xs text-gray-400">Nursery Shift Manager</p>
            </div>
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">
            スタッフ {data.staffList.length} 名登録中
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-pink-100">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setView('shift')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition
                ${
                  view === 'shift'
                    ? 'border-pink-500 text-pink-700 bg-pink-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
            >
              📋 シフト表
            </button>
            <button
              onClick={() => setView('leave')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition
                ${
                  view === 'leave'
                    ? 'border-pink-500 text-pink-700 bg-pink-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
            >
              🗓️ 休暇希望
            </button>
            <button
              onClick={() => setView('staff')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition
                ${
                  view === 'staff'
                    ? 'border-pink-500 text-pink-700 bg-pink-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
            >
              👥 スタッフ管理
            </button>
            <button
              onClick={() => setView('settings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition
                ${
                  view === 'settings'
                    ? 'border-pink-500 text-pink-700 bg-pink-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
            >
              ⚙️ 設定
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-screen-xl mx-auto">
        {view === 'shift' ? (
          <ShiftTable
            staffList={data.staffList}
            shifts={data.shifts}
            events={data.events}
            training={data.training}
            onShiftChange={handleShiftChange}
            onNoteChange={handleNoteChange}
            onEventsImport={handleEventsImport}
          />
        ) : view === 'leave' ? (
          <LeaveRequests
            staffList={data.staffList}
            shifts={data.shifts}
            leaveRequests={data.leaveRequests}
            onLeaveToggle={handleLeaveToggle}
            onApply={handleApplyLeave}
            onReset={handleLeaveReset}
          />
        ) : view === 'staff' ? (
          <StaffManager
            staffList={data.staffList}
            onAdd={handleAddStaff}
            onEdit={handleEditStaff}
            onDelete={handleDeleteStaff}
          />
        ) : (
          <Settings onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;
