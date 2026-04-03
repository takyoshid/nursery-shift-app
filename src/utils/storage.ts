import type { AppData, StaffGroup } from '../types';

const STORAGE_KEY = 'nursery-shift-app-data';

const defaultStaff: { name: string; group: StaffGroup }[] = [
  { name: '早矢仕', group: '園長' },
  { name: '小松',   group: '主任' },
  { name: '吉田',   group: '主任' },
  { name: '菅原',   group: '主任' },
  { name: '糸',     group: '主任' },
  { name: '鈴木浩', group: 'シフト固定' },
  { name: '岩井',   group: 'シフト固定' },
  { name: '石川',   group: 'シフト固定' },
  { name: '増田',   group: 'シフト固定' },
  { name: '趙',     group: '乳児クラス' },
  { name: '戸塚',   group: '乳児クラス' },
  { name: '宮下',   group: '乳児クラス' },
  { name: '川口',   group: '乳児クラス' },
  { name: '藤原',   group: '乳児クラス' },
  { name: '芳村',   group: '乳児クラス' },
  { name: '大滝',   group: '乳児クラス' },
  { name: '清水',   group: '乳児クラス' },
  { name: '高木',   group: '乳児クラス' },
  { name: '片桐',   group: '乳児クラス' },
  { name: '山中',   group: '乳児クラス' },
  { name: '斎藤な', group: '幼児クラス' },
  { name: '小堀',   group: '幼児クラス' },
  { name: '加賀谷', group: '幼児クラス' },
  { name: '鈴木里', group: '幼児クラス' },
  { name: '大竹',   group: '幼児クラス' },
  { name: '市辻',   group: '幼児クラス' },
  { name: '竹中',   group: '幼児クラス' },
  { name: '中山',   group: '加配' },
  { name: '藤/倉',  group: '加配' },
  { name: '西村',   group: '加配' },
  { name: '宮田',   group: '加配' },
  { name: '佐藤の', group: '加配' },
  { name: 'Legend', group: 'その他' },
];

const defaultData: AppData = {
  staffList: defaultStaff.map((s, i) => ({
    id: `default-${i}`,
    name: s.name,
    role: '保育士',
    employmentType: 'fulltime' as const,
    group: s.group,
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
