import * as XLSX from 'xlsx-js-style';
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

  const allRows = [headerRow1, headerRow2, eventsRow, trainingRow, ...dataRows];

  // セルを手動構築してスタイルを確実に適用
  const ws: XLSX.WorkSheet = {};
  let maxC = 0;
  allRows.forEach((row, r) => {
    row.forEach((val, c) => {
      const addr = XLSX.utils.encode_cell({ r, c });
      const isNoteDataCell = (r === 2 || r === 3) && c >= 1 && c <= days.length;
      const isShiftDataCell = r >= 4 && c >= 1 && c <= days.length;
      ws[addr] = {
        t: typeof val === 'number' ? 'n' : 's',
        v: val,
        s: isNoteDataCell ? VERTICAL_STYLE : isShiftDataCell ? CENTER_STYLE : {},
      };
      if (c > maxC) maxC = c;
    });
  });
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: allRows.length - 1, c: maxC } });

  // 列幅を統一 (画面 w-12 = 48px に合わせる)
  const dayCol = { wpx: 48 };
  ws['!cols'] = [{ wpx: 90 }, ...days.map(() => dayCol), { wpx: 56 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${year}年${month + 1}月`);

  const fileName = `保育園シフト表_${year}年${String(month + 1).padStart(2, '0')}月.xlsx`;
  XLSX.writeFile(wb, fileName);
}
