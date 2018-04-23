export interface IShift {
  start: string|Date;
  end: string|Date;
  _id: string;
}

export default class Shift implements IShift {
  start: Date;
  end: Date;
  _id: string;

  constructor(shift: Partial<IShift>) {
    this.start = new Date(shift.start);
    this.end = shift.end ? new Date (shift.end) : null;
    this._id = shift._id;
  }

  duration = (): number => {
    let { start, end } = this;
    if(!end) end = new Date();
    let seconds: number = (end.getTime() - start.getTime())/1000;
    return seconds;
  }

  readableDuration = (): string => {
    let seconds: string|number = this.duration();
    const hours = Math.floor(seconds/3600);
    seconds -= hours*3600;
    let minutes: string|number = Math.floor(seconds/60);
    seconds -= minutes*60;
    seconds = Math.floor(seconds);

    if(seconds < 10) seconds = `0${seconds}`;
    if(minutes < 10) minutes = `0${minutes}`;

    return `${hours}:${minutes}:${seconds}`;
  }
}
