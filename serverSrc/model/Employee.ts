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
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
});

employee.virtual('activeShift').get(function() {
  let active = this.shifts.filter(i => !i.end);
  if(active.length > 1) throw Error();
  return active[0];
})

export interface IEmployee extends Document {
  name: string;
  shifts: Types.DocumentArray<IShift>;
  hourlyRate: number;
  activeShift: IShift;
  updatedAt: Date;
  createdAt: Date;
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
    .catch(e => {
      console.error(e.message);
      throw e;
    })

export const stopShift = (employee: string, end?: string|Date): Promise<{shift:IShift,_id:string,updatedAt:Date}> =>
  Employee.findById(employee)
    .then(employee => {
      if(!(employee && employee.activeShift)) throw Error();
      end = end ? new Date(end) : new Date();
      const shift = employee.shifts.id(employee.activeShift._id);
      shift.end = end;
      employee.save();
      return {shift, _id: employee._id, updatedAt: employee.updatedAt};
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


export const updateShift = (employee: string, shift: IShift): Promise<IShift> =>
  Employee.findById(employee)
    .then(employee => {
      if(!employee) throw Error();
      const record = employee.shifts.id(shift._id);

      if(!shift) throw Error();
      record.start = shift.start || record.start;
      record.end = shift.end || record.end;
      employee.save();

      return record;
    })


export const addEmployee = (employee: Partial<IEmployee>): Promise<IEmployee> =>
  new Employee(employee).save();


export const updateEmployee = (employee: Partial<IEmployee>): Promise<IEmployee> =>
  Employee.findById(employee._id)
    .then((e: IEmployee) => {
      if(!employee) throw Error();
      delete employee.shifts;
      employee.updatedAt = new Date();
      Object.keys(employee).map((field: string) => e[field] = employee[field]);
      e.save();
      return e;
    });

export const removeEmployee = (employee: string):Promise<boolean> =>
  Employee.findByIdAndRemove(employee)
    .then(employee => !!employee);
