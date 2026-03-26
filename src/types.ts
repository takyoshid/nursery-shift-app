export type EmploymentType = 'fulltime' | 'parttime';

export interface Staff {
  id: string;
  name: string;
  role: string;
  employmentType: EmploymentType;
}

export type ShiftType = '早番' | '遅番' | '日勤' | '休み' | '有休' | '';

export interface ShiftEntry {
  staffId: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
}

export interface AppData {
  staffList: Staff[];
  shifts: ShiftEntry[];
}
