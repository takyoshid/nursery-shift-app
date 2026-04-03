import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Staff, ShiftEntry } from '../types';

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

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export async function exportToExcel(
  staffList: Staff[],
  shifts: ShiftEntry[],
  year: number,
  month: number,
  events: Record<string, string>,
  training: Record<string, string>
): Promise<void> {
  const days = getDaysInMonth(year, month);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`${year}年${month + 1}月`);

  // 列幅設定（スタッフ名列 + 日付列 + 出勤日数列）
  ws.columns = [
    { width: 12 },
    ...days.map(() => ({ width: 6 })),
    { width: 8 },
  ];

  // ヘッダー行1: 日付
  const hRow1 = ws.addRow(['スタッフ名', ...days.map((d) => `${d.getDate()}日`), '出勤日数']);
  hRow1.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4EC' } };
  });

  // ヘッダー行2: 曜日
  const hRow2 = ws.addRow(['役職', ...days.map((d) => DOW_LABELS[d.getDay()]), '']);
  hRow2.eachCell((cell, colNo) => {
    const dow = days[colNo - 2]?.getDay();
    const isSun = dow === 0;
    const isSat = dow === 6;
    cell.font = { bold: true, color: { argb: isSun ? 'FFEF5350' : isSat ? 'FF1565C0' : 'FF555555' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4EC' } };
  });

  // 行事予定行
  const eventsRowData = ['行事予定', ...days.map((d) => events[formatDate(d)] ?? ''), ''];
  const evRow = ws.addRow(eventsRowData);
  evRow.height = 60;
  evRow.getCell(1).font = { bold: true, color: { argb: 'FF9C1A1A' } };
  evRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4EC' } };
  evRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  days.forEach((_d, i) => {
    const cell = evRow.getCell(i + 2);
    cell.alignment = { textRotation: 255, vertical: 'top', horizontal: 'center', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
  });

  // 地域・研修等行
  const trainingRowData = ['地域・研修等', ...days.map((d) => training[formatDate(d)] ?? ''), ''];
  const trRow = ws.addRow(trainingRowData);
  trRow.height = 60;
  trRow.getCell(1).font = { bold: true, color: { argb: 'FF0D4F3C' } };
  trRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2F1' } };
  trRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  days.forEach((_d, i) => {
    const cell = trRow.getCell(i + 2);
    cell.alignment = { textRotation: 255, vertical: 'top', horizontal: 'center', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2F1' } };
  });

  // シフトデータ行
  const shiftMap: Record<string, Record<string, string>> = {};
  for (const entry of shifts) {
    if (!shiftMap[entry.staffId]) shiftMap[entry.staffId] = {};
    shiftMap[entry.staffId][entry.date] = entry.shiftType;
  }

  staffList.forEach((staff) => {
    const staffShifts = shiftMap[staff.id] ?? {};
    let workDays = 0;
    const cells = days.map((d) => {
      const shift = staffShifts[formatDate(d)] ?? '';
      if (shift && shift !== '休み' && shift !== '有休') workDays++;
      return shift;
    });
    const row = ws.addRow([staff.name, ...cells, workDays]);
    row.getCell(1).alignment = { vertical: 'middle' };
    days.forEach((_, i) => {
      row.getCell(i + 2).alignment = { vertical: 'middle', horizontal: 'center' };
    });
    row.getCell(days.length + 2).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(days.length + 2).font = { bold: true };
  });

  // ダウンロード
  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `保育園シフト表_${year}年${String(month + 1).padStart(2, '0')}月.xlsx`
  );
}
