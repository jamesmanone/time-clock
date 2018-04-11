import { model, Schema, Docunent } from 'mongoose';

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
});

export interface IShift extends Document {
  start: Date;
  end?: Date;
  hours: any;
}

export interface IEmployee extends Document {
  name: string;
  shifts: IShift[];
  hourlyRate: number;
}

const Employee: model<IEmployee> = new model<IEmployee>('employee', employee);

export default Employee;

export const startShift = (employee: string): IEmployee => {
  return Employee.findById(employee)
    .then(employee => {
      employee.shifts.push({start: new Date()});
      return employee.save()
    })
}

export const endShift = (employee: string, id: string): IEmployee =>
  Employee.findById(employee)
    .then(employee => {
      if(!employee) throw Error();
      const shift = employee!.shifts.id(id);
      if(!shift) throw Error();
      shift.end = new Date();
      return employee.save();
    });


export const addEmployee = (employee: Partial<IEmployee>): IEmployee =>
  new Employee(employee).save();


export const updateEmployee = (employee: Partial<IEmployee>) => {
  Employee.findById(employee._id)
    .then((e: IEmployee) => {
      if(!employee) throw Error();
      Object.keys(employee).map((field: string) => e[field] = employee[field]);
      return employee.save();
    })
};

export const removeEmployee = (employee: string):boolean => {
  return Employee.findByIdAndRemove(employee)
}