import XLSX from 'xlsx-js-style';
import type { Staff, ShiftEntry } from '../types';

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const daysCount = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysCount; d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

// textRotation: 255 = Excel の縦書き（CJK文字を縦に積む）
const VERTICAL_STYLE = { alignment: { textRotation: 255, vertical: 'center', horizontal: 'center' } };
const CENTER_STYLE   = { alignment: { vertical: 'center', horizontal: 'center' } };

export function exportToExcel(
  staffList: Staff[],
  shifts: ShiftEntry[],
  year: number,
  month: number,
  events: Record<string, string>,
  training: Record<string, string>
): void {
  const days = getDaysInMonth(year, month);

  const headerRow1  = ['スタッフ名', ...days.map((d) => `${d.getDate()}日`), '出勤日数'];
  const headerRow2  = ['役職',       ...days.map((d) => DOW_LABELS[d.getDay()]), ''];
  const eventsRow   = ['行事予定',   ...days.map((d) => events[formatDate(d)]   ?? ''), ''];
  const trainingRow = ['地域・研修等', ...days.map((d) => training[formatDate(d)] ?? ''), ''];

  const shiftMap: Record<string, Record<string, string>> = {};
  for (const entry of shifts) {
    if (!shiftMap[entry.staffId]) shiftMap[entry.staffId] = {};
    shiftMap[entry.staffId][entry.date] = entry.shiftType;
  }

  const dataRows = staffList.map((staff) => {
    const staffShifts = shiftMap[staff.id] ?? {};
    let workDays = 0;
    const cells = days.map((d) => {
      const dateStr = formatDate(d);
      const shift = staffShifts[dateStr] ?? '';
      if (shift && shift !== '休み' && shift !== '有休') workDays++;
      return shift;
    });
    return [staff.name, ...cells, workDays];
  });

  const wsData = [headerRow1, headerRow2, eventsRow, trainingRow, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // 列幅を統一 (画面 w-12 = 48px に合わせる)
  const dayCol = { wpx: 48 };
  ws['!cols'] = [{ wpx: 90 }, ...days.map(() => dayCol), { wpx: 56 }];

  // 行事予定・地域研修行のデータセルに縦書きスタイルを適用
  const noteRowIndices = [2, 3]; // eventsRow=2, trainingRow=3
  noteRowIndices.forEach((rowIdx) => {
    days.forEach((_, colIdx) => {
      const addr = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx + 1 });
      if (!ws[addr]) ws[addr] = { t: 's', v: '' };
      ws[addr].s = VERTICAL_STYLE;
    });
  });

  // シフトセルを中央揃えに
  for (let rowIdx = 4; rowIdx < 4 + staffList.length; rowIdx++) {
    days.forEach((_, colIdx) => {
      const addr = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx + 1 });
      if (ws[addr]) ws[addr].s = CENTER_STYLE;
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${year}年${month + 1}月`);

  const fileName = `保育園シフト表_${year}年${String(month + 1).padStart(2, '0')}月.xlsx`;
  XLSX.writeFile(wb, fileName);
}
