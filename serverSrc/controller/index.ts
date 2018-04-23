import { Request, Response, RequestHandler, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

import * as model from '../model/Employee';
import * as User from '../model/User'
import { Employee } from '../model/Employee';

type EmployeeList = string[]|string;

interface ShiftId {
  employee: string;
  shift: string;
}

const secret: string = 'jumppinjehosaphat'

type ShiftList = ShiftId|ShiftId[];

export const login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const credentials: { username: string,password: string } = req.body;
  User.byUsername(credentials.username)
    .then(user => {
      if(!user) return res.sendStatus(401);
      const valid = User.checkPassword(credentials.password, user.passhash);
      if(valid) {
        let token = jwt.sign({
            id: user._id,
            username: user.username,
          },
          secret,
          {expiresIn:'720h'});
        res.send({token});
      } else {
        res.sendStatus(401);
      }
    })
    .catch(e => {
      res.sendStatus(401);
      console.log(e.message);
    });
}

export const verifyToken: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  let token;
  try {
    token = jwt.verify(req.headers.authorization, secret);
    User.findById(token.id)
      .then((user: User.IUser) => {
        if(!user) throw Error();
        (req as any).user = user;
        next();
      })
      .catch(e => res.sendStatus(401));
  } catch (e) {
    res.sendStatus(401);
  }
}

export const newUser = (req: Request, res: Response): void => {
  const userInfo: { username: string, password: string } = req.body;
  const user = User.addUser({username: userInfo.username, passhash: userInfo.password});
  if(!user) res.sendStatus(400);
  else res.sendStatus(200);
}

export const getEmployees = (req: Request, res: Response): void => {
  model.getEmployees()
    .then((employees: model.IEmployee[]) => res.send({employees}))
    .catch(() => res.sendStatus(500));
};

export const getEmployee = (req: Request, res: Response): void => {
  Employee.findById(req.params.id)
    .then(employee => {
      if(!employee) return res.sendStatus(404);
      res.send(employee);
    })
}

export const addEmployee = (req: Request, res: Response): void => {
  const employee: Partial<model.IEmployee> = req!.body;
  if(!(employee && employee!.name)) {
    res.sendStatus(400);
    return;
  }
  const e = new model.Employee(employee);
  e.save();
  res.send(e.toJSON());
};

export const updateEmployee = (req: Request, res: Response): void => {
  const employee: Partial<model.IEmployee> = req.body;
  model.updateEmployee(employee)
    .then(employee => {
      if(!employee) throw Error();
      res.send(employee);
    })
    .catch(() => res.sendStatus(400));
}

export const deleteEmployee = (req: Request, res: Response): void => {
  const employee: string = req.params!.id;
  model.removeEmployee(employee)
    .then((done: boolean) => done ? res.sendStatus(200) : res.sendStatus(400))
    .catch(() => res.sendStatus(400));
}

const newShifts = (employees: string[], res: Response): void => {
  let p: Promise<model.IEmployee>[] = employees.map(employee => model.startShift(employee));
  Promise.all(p)
    .then(employees => res.send(employees))
    .catch(() => res.sendStatus(400));

};

export const newShift = (req: Request, res: Response): void => {
  const employees: EmployeeList = req.body.employees;
  if(employees instanceof Array) return newShifts(employees, res);

  model.startShift(employees as string)
    .then((employee: model.IEmployee) => {
      res.json(employee);
    })
    .catch(() => res.sendStatus(400));
};

const endShifts = (shifts: ShiftId[], res: Response): void => {
  const p: Promise<model.IEmployee>[] = shifts.map(shift => model.endShift(shift.employee, shift.shift));
  Promise.all(p)
    .then(employees => res.send(employees))
    .catch(() => res.sendStatus(400));
}

export const endShift = (req: Request, res: Response): void => {
  const shifts: ShiftId|ShiftId[] = req.body.shifts;
  if(shifts instanceof Array) return endShifts(shifts, res);
  model.endShift(shifts.employee, shifts.shift)
    .then(employee => res.send(employee))
    .catch(() => res.sendStatus(400));
}

export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const { ip, path, method } = req;
  console.log(`${ip} requested ${method} ${path}`);
  next();
}
