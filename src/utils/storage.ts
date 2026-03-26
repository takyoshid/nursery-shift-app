import type { AppData } from '../types';

const STORAGE_KEY = 'nursery-shift-app-data';

const defaultData: AppData = {
  staffList: [],
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
