export type EmploymentType = 'fulltime' | 'parttime';

export interface Staff {
  id: string;
  name: string;
  role: string;
  employmentType: EmploymentType;
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
}
