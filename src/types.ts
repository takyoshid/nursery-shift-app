export type EmploymentType = 'fulltime' | 'parttime';

export type StaffGroup = '園長' | '主任' | 'シフト固定' | '乳児クラス' | '幼児クラス' | '加配' | 'その他';

export const STAFF_GROUPS: StaffGroup[] = ['園長', '主任', 'シフト固定', '乳児クラス', '幼児クラス', '加配', 'その他'];

export const GROUP_STYLES: Record<StaffGroup, { bg: string; text: string; headerBg: string; headerText: string }> = {
  '園長':     { bg: 'bg-amber-50',   text: 'text-amber-800',   headerBg: 'bg-amber-100',   headerText: 'text-amber-800' },
  '主任':     { bg: 'bg-purple-50',  text: 'text-purple-800',  headerBg: 'bg-purple-100',  headerText: 'text-purple-800' },
  'シフト固定': { bg: 'bg-slate-50',   text: 'text-slate-700',   headerBg: 'bg-slate-200',   headerText: 'text-slate-700' },
  '乳児クラス': { bg: 'bg-sky-50',     text: 'text-sky-800',     headerBg: 'bg-sky-100',     headerText: 'text-sky-800' },
  '幼児クラス': { bg: 'bg-emerald-50', text: 'text-emerald-800', headerBg: 'bg-emerald-100', headerText: 'text-emerald-800' },
  '加配':     { bg: 'bg-orange-50',  text: 'text-orange-800',  headerBg: 'bg-orange-100',  headerText: 'text-orange-800' },
  'その他':   { bg: 'bg-gray-50',    text: 'text-gray-700',    headerBg: 'bg-gray-200',    headerText: 'text-gray-700' },
};

export interface Staff {
  id: string;
  name: string;
  role: string;
  employmentType: EmploymentType;
  group: StaffGroup;
}

export type ShiftType = 'A"' | 'A' | 'B"' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | '休み' | '有休' | '';

export interface ShiftEntry {
  staffId: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
}

export interface AppData {
  staffList: Staff[];
  shifts: ShiftEntry[];
  events: Record<string, string>;   // date -> 行事予定テキスト
  training: Record<string, string>; // date -> 地域・研修等テキスト
}
