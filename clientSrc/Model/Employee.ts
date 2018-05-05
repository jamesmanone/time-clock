import Shift from './Shift';
import * as shortid from 'shortid';

export interface IEmployee {
  name: string;
  hourlyRate: number;
  shifts: Shift[]
  _id?: string;
  updatedAt: Date|string;
  createdAt: Date|string;
  activeShift?: Shift;
  thisWeek?: Shift[];
  hoursForWeek: (end?:Date)=>number;
  payForWeek: (end?:Date)=>string;
  clone: ()=>Employee;
}




export default class Employee implements IEmployee {
  name: string;
  hourlyRate: number;
  shifts: Shift[]
  _id?: string;
  updatedAt: Date|string;
  createdAt: Date|string;
  activeShift?: Shift;
  thisWeek?: Shift[];

  constructor(employee: Partial<IEmployee>) {
    this.name = employee.name;
    this.hourlyRate = employee.hourlyRate;
    this.shifts = employee.shifts ?
      employee.shifts.map(s => new Shift(s)) :
      [];
    this._id = employee._id || shortid.generate();
    this.createdAt = employee.createdAt ? new Date(employee.createdAt) : new Date();
    this.updatedAt = employee.updatedAt ? new Date(employee.updatedAt) : new Date();
    this.activeShift = employee.activeShift ? new Shift(employee.activeShift) : null;
    const weekStart = Employee.weekStart().getTime();
    this.thisWeek = this.shifts.filter(i => i.start.getTime() > weekStart);
  }

  private static weekStart(date?: Date) {
    const start = date ? new Date(date) : new Date();
    start.setHours(0);
    // Lazy, Filthy, Sloppy coder. You dissapoint me.
    // TODO: Make this not the most ineffecient way to do things
    while(start.getDay() != 3) start.setDate(start.getDate() - 1);
    return start;
  }

  private static hoursToString = (hours: number): string => {
    if(!hours) return '0:00:00';
    let minutes: string|number = (hours % 1) * 60;
    let seconds: string|number = Math.floor((minutes % 1) * 60);
    minutes = Math.floor(minutes);
    hours = Math.floor(hours);
    seconds = Math.floor(seconds)
    minutes = minutes < 10 ? `0${minutes}` : minutes.toString();
    seconds = seconds < 10 ? `0${seconds}` : seconds.toString();
    return `${hours}:${minutes}:${seconds}`;
  }

  hoursForWeek = (weekEnd?: Date): number => {
    const start = Employee.weekStart(weekEnd);
    const weekShifts: Shift[] = weekEnd ?
      this.shifts.filter(s =>
        s.start.getTime() > start.getTime() &&
        s.start.getTime() < weekEnd.getTime()
      ) :
      this.thisWeek;
    return weekShifts.reduce((a: number, s: Shift): number => a + s.duration(), 0)/3600;
  }

  readableHoursForWeek = (weekEnd?: Date): string => {
    let hours = weekEnd ? this.hoursForWeek(weekEnd) : this.hoursForWeek();
    return Employee.hoursToString(hours)
  }

  // recursive binary search
  getLimit = (limit: Date, shifts: Shift[]=[...this.shifts]): number => {
    const pivotIndex = Math.floor(shifts.length/2);
    if(!pivotIndex) return 0;  // end of array

    const data = shifts[pivotIndex].start;

    if(
        limit.getTime() <= data.getTime() &&
        limit.getTime() >= shifts[pivotIndex-1].start.getTime()
    ) return pivotIndex;
    else if(limit.getTime() > data.getTime())
      return this.getLimit(limit, shifts.slice(pivotIndex+1)) + pivotIndex+1;
    else return this.getLimit(limit, shifts.slice(0, pivotIndex-1));
  }

  getStartEndIndex = (startDate: Date, endDate: Date): {start:number,end:number} => {
    let start = this.getLimit(startDate),
        end = this.getLimit(endDate, this.shifts.slice(start)) + 1;
    if(end >= this.shifts.length) end = this.shifts.length - 1;
    return { start, end };
  }

  getPastWeekShifts = (back=0): Shift[] => {
    const endDate = Employee.weekStart();
    endDate.setDate(endDate.getDate()+6-(back*7));
    const startDate = Employee.weekStart(endDate);
    endDate.setHours(23);
    const { start, end } = this.getStartEndIndex(startDate, endDate);
    return this.shifts.slice(start, end);
  }

  getDatesForBackWeek = (back=0): {start:Date,end:Date} => {
    const end = Employee.weekStart();
    end.setDate(end.getDate()+6-(back*7));
    const start = Employee.weekStart(end);
    return {start, end};
  }

  payForWeek = (weekEnd?: Date): string => {
    let hours: number = weekEnd ? this.hoursForWeek(weekEnd) : this.hoursForWeek();
    if(!hours) return '0.00';
    if(hours > 40) hours = ((hours-40)*1.5)+40;
    return (hours * this.hourlyRate).toFixed(2);
  }

  payFor4Weeks = (): string[] => {
    let end = new Date();
    end.setHours(23);
    let arr: string[] = [];
    let i = 4;
    while(i--) {
      arr.push(this.payForWeek(end));
      end = Employee.weekStart(end);
      end.setDate(end.getDate()-1);
      end.setHours(23);
    }
    return arr;
  }

  hoursFor4Weeks = (): string[] => {
    let end = new Date();
    let arr: string[] = [];
    let i = 4;
    while(i--) {
      arr.push(this.readableHoursForWeek(end));
      end = Employee.weekStart(end);
      end.setDate(end.getDate()-1);
      end.setHours(23);
    }
    return arr;
  }

  fourWeekInfo = (): {hours:string,pay:string,key:number}[] => {
    let arr: {hours:string,pay:string,key:number}[] = [];
    let hours = this.hoursFor4Weeks();
    let pay = this.payFor4Weeks();
    let i = 4;
    while(i--) {
      arr[i] = {
        hours: hours[i],
        pay: pay[i],
        key: i
      }
    }
    return arr;
  }

  hoursForMonth = (): number => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0);
    const shifts = this.shifts.filter(shift => shift.start.getTime() > start.getTime());
    return shifts.reduce((a: number, s: Shift): number => a + s.duration(), 0)/3600;
  }

  readableHoursForMonth = (): string => {
    let hours = this.hoursForMonth();
    return Employee.hoursToString(hours);
  }

  clone = ():Employee => new Employee(this);

  updateWeek = (): void => {
    const weekStart = Employee.weekStart().getTime();
    this.thisWeek = this.shifts.filter(i => i.start.getTime() > weekStart);
  }

  startShift = (): string => {
    if(this.activeShift) throw Error('No double dipping');
    const shift = new Shift({start: new Date(), _id: shortid.generate()});
    this.shifts.push(shift);
    this.activeShift = shift;
    this.updateWeek();
    return shift._id;
  }

  removeShift = (id: string): void => {
    this.shifts = this.shifts.filter(i => i._id !== id);
    this.updateWeek();
  }

  endShift = (): void => {
    if(!this.activeShift) return;
    const { start, _id } = this.activeShift;
    const shift = new Shift({start, _id, end: new Date()});
    this.shifts = [
      ...this.shifts.filter(shift => shift._id !== _id),
      shift
    ];
    this.activeShift = null;
  }

  restoreShift = (id: string): void => {
    const shift = this.shifts.filter(shift => shift._id == id)[0];
    if(!shift) return;
    shift.end = undefined;
    this.activeShift = shift;
  }

}
