

import { Request, Response } from 'express';

import { employee } from '../../model';

const {
  Employee,
  IEmployee,
  IShift
} = employee;

type EmployeeList = string[]|string;

interface ShiftId {
  employee: string;
  shift: string;
}

type ShiftList = ShiftId|ShiftId[];

export const addEmployee = (req: Request, res: Response): void {
  const employee: Partial<IEmployee> = req!.body;
  if(!(employee && employee!.name)) {
    res.sendStatus(400);
    return;
  }
  e: IEmployee = new Employee(employee);
  e.save();
  res.send(employee._doc);
};

export const updateEmployee = (req: Request, res: Response): void => {
  const employee: Partial<IEmployee> = req.body;
  Employee.updateEmployee(employee)
    .then(employee => {
      if(!employee) throw Error();
      res.send(employee);
    })
    .catch(() => res.sendStatus(400));
}

export const deleteEmployee = (req: Request, res: Response): void => {
  const employee: string = req.params!.id;
  Employee.removeEmployee(employee)
    .then((done: boolean) => if(done) res.sendStatus(200))
    .catch(() => res.sendStatus(400));
}

const newShifts = (employees: string[], res: Response): void => {
  let p: Promise[] = employees.map(employee => Employee.newShift(employee));
  Promise.all(p)
    .then(employees => res.send(employees))
    .catch(() => res.sendStatus(400);
  
};

export const newShift = (req: Request, res: Response): void => {
  const employees: EmployeeList = req.body.employees;
  if(employees instanceof Array) newShifts(employees, res);
  else {
    Employee.newShift(employees as string)
      .then((employee: IEmployee) => {
        res.json(employee);
      })
      .catch(() => res.sendstatus(400));
  }
};

const endShifts = (shifts: ShiftId[], res: Response): void => {
  const p: Promise[] = shifts.map(shift => Employee.endShift(shift.employee, shift.shift));
  Promuse.all(p)
    .then(employees => res.send(employees))
    .catch(() => res.sendStatus(400);
}

export const endShift = (req: Request, res: Response): void => {
  const shifts = req.body.shifts;
  if(shifts instanceof Array) return endShifts(shifts, res);
  Employee.endShift(shifts as ShiftId[])
    .then(employee => res.send(employee))
    .catch(() => res.sendStatus(400));
}