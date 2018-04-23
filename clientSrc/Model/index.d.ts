export interface Shift {
  employee: string;
  start: string|Date;
  end: string|Date;
  _id: string;
}

export interface Employee {
  name: string;
  hourlyRate: number;
  shifts: Shift[]
  _id: string;
  updatedAt: Date|string;
  createdAt: Date|string;
}
