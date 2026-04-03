import ExcelJS from 'exceljs';

function toDateStr(value: ExcelJS.CellValue): string | null {
  if (!value) return null;

  // ExcelJS が Date オブジェクトとして読み込んだ場合
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 文字列の場合（例: "2026/04/05", "2026-04-05", "4/5" など）
  if (typeof value === 'string') {
    // スラッシュ区切り → YYYY/MM/DD または M/D
    const slashMatch = value.match(/^(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (slashMatch) {
      const y = slashMatch[1].length === 2 ? `20${slashMatch[1]}` : slashMatch[1];
      const m = slashMatch[2].padStart(2, '0');
      const d = slashMatch[3].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // Date.parse で試みる
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return toDateStr(parsed);
    }
  }

  // Excel シリアル値（数値）
  if (typeof value === 'number') {
    // Excel の日付シリアル値を Date に変換
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return toDateStr(date);
  }

  return null;
}

export async function importEventsFromExcel(file: File): Promise<Record<string, string>> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());

  const ws = wb.worksheets[0];
  const events: Record<string, string> = {};

  ws.eachRow((row) => {
    const dateCell = row.getCell(1);
    const nameCell = row.getCell(2);

    const dateStr = toDateStr(dateCell.value);
    if (!dateStr) return; // ヘッダー行や空行はスキップ

    const eventName = nameCell.value != null ? String(nameCell.value).trim() : '';
    if (!eventName) return;

    // 同じ日に複数行事がある場合は改行で結合
    events[dateStr] = events[dateStr] ? `${events[dateStr]}\n${eventName}` : eventName;
  });

  return events;
}
