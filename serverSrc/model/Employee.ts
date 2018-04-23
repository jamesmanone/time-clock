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

export interface IEmployee extends Document {
  name: string;
  shifts: Types.Array<IShift>;
  hourlyRate: number;
}

export const Employee: Model<IEmployee> = model<IEmployee>('employee', employee);

export const getEmployees = (): DocumentQuery<IEmployee[], IEmployee> => {
  return Employee.find()
}


export const startShift = (employee: string): Promise<IEmployee> =>
  Employee.findById(employee)
    .then(employee => {
      employee.shifts.push({start: new Date()});
      employee.save();
      return employee;
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
