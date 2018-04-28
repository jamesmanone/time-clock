import {
  model,
  Schema,
  Types,
  Document,
  Model,
  DocumentQuery,
} from 'mongoose';

const Shift: Schema = new Schema({
  start: {
    type: Date,
    required: true
  },
  end: Date
});

Shift.virtual('hours').get(function(): number {
  const end: number = this.end.getTime() || new Date().getTime();
  const start: number = this.start.getTime();
  return (end - start)/3600000
});

export interface IShift extends Document {
  start: Date;
  end?: Date;
  hours?: any;
}


const employee: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  shifts: [Shift],
  hourlyRate: {
    type: Number,
    required: true
  }
}, {timestamps: true});

employee.virtual('activeShift').get(() => {
  let active = this.shifts.filter(i => !i.end);
  if(active.length > 1) throw Error();
  return active[0];
})

export interface IEmployee extends Document {
  name: string;
  shifts: Types.Array<IShift>;
  hourlyRate: number;
  activeShift: IShift;
}

export const Employee: Model<IEmployee> = model<IEmployee>('employee', employee);

export const getEmployees = (): DocumentQuery<IEmployee[], IEmployee> => {
  return Employee.find()
}


export const startShift = (employee: string, start?: string|Date): Promise<IEmployee> =>
  Employee.findById(employee)
    .then(employee => {
      if(!(employee && !employee.activeShift)) return null;
      if(!start) start = new Date();
      employee.shifts.push({start});
      employee.save();
      return employee;
    })

export const stopShift = (employee: string, end?: string|Date): Promise<{shift:IShift,_id:string}> =>
  Employee.findById(employee)
    .then(employee => {
      if(!(employee && employee.activeShift)) return null;
      end = end ? new Date(end) : new Date();
      const shift = employee.activeShift;
      employee.activeShift.end = end;
      return {shift, _id: employee._id};
    })


export const endShift = (employee: string, id: string): Promise<IEmployee> =>
  Employee.findById(employee)
    .then(employee => {
      if(!employee) throw Error();
      const shift = (employee!.shifts as Types.DocumentArray<IShift>).id(id);
      if(!shift) throw Error();
      shift.end = new Date();
      return employee.save();
    });


export const addEmployee = (employee: Partial<IEmployee>): Promise<IEmployee> =>
  new Employee(employee).save();


export const updateEmployee = (employee: Partial<IEmployee>): Promise<IEmployee> =>
  Employee.findById(employee._id)
    .then((e: IEmployee) => {
      if(!employee) throw Error();
      Object.keys(employee).map((field: string) => e[field] = employee[field]);
      e.save();
      return e;
    });

export const removeEmployee = (employee: string):Promise<boolean> =>
  Employee.findByIdAndRemove(employee)
    .then(employee => !!employee);
