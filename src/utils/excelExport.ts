import * as XLSX from 'xlsx';
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

export function exportToExcel(
  staffList: Staff[],
  shifts: ShiftEntry[],
  year: number,
  month: number
): void {
  const days = getDaysInMonth(year, month);

  // Build header row: [スタッフ名, ...日付ラベル, 出勤日数]
  const headerRow1 = ['スタッフ名', ...days.map((d) => `${d.getDate()}日`), '出勤日数'];
  const headerRow2 = ['役職', ...days.map((d) => DOW_LABELS[d.getDay()]), ''];

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
      if (shift && shift !== '休み' && shift !== '有休') {
        workDays++;
      }
      return shift;
    });
    return [staff.name, ...cells, workDays];
  });

  const wsData = [headerRow1, headerRow2, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [{ wch: 12 }, ...days.map(() => ({ wch: 6 })), { wch: 8 }];

  // Style header rows (xlsx-js-style would be needed for full styling, basic version here)
  const wb = XLSX.utils.book_new();
  const sheetName = `${year}年${month + 1}月`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const fileName = `保育園シフト表_${year}年${String(month + 1).padStart(2, '0')}月.xlsx`;
  XLSX.writeFile(wb, fileName);
}
