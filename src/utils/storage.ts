import type { AppData } from '../types';

const STORAGE_KEY = 'nursery-shift-app-data';

const defaultStaffNames = [
  '早矢仕', '小松', '吉田', '菅原', '糸', '鈴木浩', '岩井', '石川',
  '増田', '趙', '戸塚', '宮下', '川口', '藤原', '芳村', '大滝',
  '清水', '高木', '片桐', '山中', '斎藤な', '小堀', '加賀谷', '鈴木里',
  '大竹', '市辻', '竹中', '中山', '藤/倉', '西村', '宮田', '佐藤の', 'Legend',
];

const defaultData: AppData = {
  staffList: defaultStaffNames.map((name, i) => ({
    id: `default-${i}`,
    name,
    role: '保育士',
    employmentType: 'fulltime' as const,
  })),
  shifts: [],
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    return {
      staffList: parsed.staffList ?? [],
      shifts: parsed.shifts ?? [],
    };
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('データの保存に失敗しました', e);
  }
}
