import axios from 'axios';
import * as JWT from 'jwt-client';
import * as shortid from 'shortid';
import Employee, { IEmployee } from './Employee';
import Shift, { IShift } from './Shift';

import SocketAPI from './SocketAPI';


export type Listener<T> = (e:T)=>void;

export interface IModel {
  getEmployee: (id:string) => (fn:Listener<Employee>)=>string;
  getEmployees: (fn:Listener<Employee[]>)=>string;
  addEmployee: (employee: Partial<Employee>, rn:()=>void)=>void;
  updateEmployee: (employee: Employee)=>void;
  removeEmployee: (employee: Employee)=>void;
  startShift: (ids:string|string[])=>void;
  endShift: (ids:ShiftId|ShiftId[])=>void;
  login: (credentials:{username:string, password:string}, fn:(success:boolean)=>void)=>void;
  logout: (onLogout: ()=>void)=>void;
  getLogin: (fn:Listener<boolean>)=>string;
  getWSStatus: (fn:Listener<boolean>)=>string;
  unsubscribe: (id:string)=>void;
  refreshEmployees: ()=>void;
  refreshEmployee: (id:string)=>void;
}

interface ListenerMap<T> {
  [key: string]: Listener<T>;
}

interface Doc {
  doc: Employee;
  listeners: ListenerMap<Employee>;
}

interface EmployeeMap {
  [key:string]: Doc
}

interface ShiftId {
  employee: string;
  shift: string;
}

export default class Model implements IModel {
  private isLoggedIn: boolean;
  private employees: EmployeeMap = {};
  private employeesListeners: ListenerMap<Employee[]> = {};
  private WSListeners: ListenerMap<boolean> = {};
  private loginListeners: ListenerMap<boolean> = {};
  private user: string;
  private SocketAPI: SocketAPI;

  private readonly urls = {
    shifts: '/api/shifts',
    employees: '/api/employees',
    login: '/api/login'
  };

  constructor() {
    this.employees = {};
    try {
      const token = JWT.remember() as any;
      if(token && JWT.validate(token)) {
        this.isLoggedIn = true;
        this.SocketAPI = new SocketAPI(this);
      } else throw Error();
    } catch(e) {
      this.isLoggedIn = false;
    }

    // refresh employees when page becomes visible
    window.document.addEventListener('visibilitychange', this.visibilityChange);
  }

  private visibilityChange = () => {
    if(document.visibilityState !== 'hidden') {
      this.refreshEmployees();
    }
  }

  getLogin = (fn: Listener<boolean>):string => {
    const ident = shortid.generate();
    this.loginListeners[ident] = fn;
    fn(this.isLoggedIn);
    return ident;
  }

  private notifyLoginSubscribers = () => {
    Object.values(this.loginListeners).map((fn: Listener<boolean>) => fn(this.isLoggedIn));
  }

  getWSStatus = (fn: Listener<boolean>):string => {
    const ident = shortid.generate();
    this.WSListeners[ident] = fn;
    fn(this.SocketAPI && this.SocketAPI.active);
    return ident;
  };

  private notifyWSSubscribers = () => {
    Object.values(this.WSListeners).map((fn: Listener<boolean>) => fn(this.SocketAPI && this.SocketAPI.active));
  }

  updateWS = () => this.notifyWSSubscribers();

  private getConfig = () => ({
    headers: {
      Authorization: JWT.get()
    }
  });

  addUser = ({username, password}, fn:()=>void) => {
    (axios as any).post('/api/adduser', {username, password}, this.getConfig())
      .then(fn)
      .catch(e => console.error(e.message));
  }



  login = (
    credentials: {username:string, password:string},
    fn: (success:boolean)=>void): void => {

    const { username, password } = credentials;
    (axios as any).post(`${this.urls.login}`, {username, password})
      .then(({data}) => {
        if(data.token && JWT.validate(JWT.read(data.token))) {
          JWT.keep(data.token);
          fn(true);
          this.isLoggedIn = true;
          this.notifyLoginSubscribers();
          this.SocketAPI = new SocketAPI(this);
        }
      })
      .catch(e => {
        console.error(e.message);
        alert('Incorrect username or password');
        fn(false);
      });
  }

  logout = (onLogout: ()=>void): void => {
    this.isLoggedIn = false;
    this.notifyLoginSubscribers();
    JWT.forget();
    this.employees = {};
    onLogout();
    this.SocketAPI = null;
  };

  findById = (id: string): Employee => {
    // debugger;
    return this.employees[id] ? this.employees[id].doc.clone() : null;
  }


  private put = (employee: Employee, force?: boolean): boolean => {
    const { _id } = employee;
    if(this.employees[_id] && (this.shouldUpdate(employee) || force)) {
      this.employees[_id].doc = new Employee(employee);
      this.notifySubscribers(_id);
      return true;
    }
    return false;
  }

  putFromWS = (employee: Employee): void => {
    const { _id } = employee;
    if(this.employees[_id] && (this.shouldUpdate(employee))) {
      this.employees[_id].doc = employee;
      this.notifySubscribers(_id);
      this.notifySubscribers();
    }
  }

  upsertFromWS = (employee: Employee): void => {
    const { _id } = employee;
    if(!this.employees[_id]) {
      this.employees[_id] = {
        doc: employee,
        listeners: {}
      };
      this.notifySubscribers();
    } else this.putFromWS(employee);
  }

  deleteFromWS = (id: string): void => {
    if(this.employees[id]) {
      this.employees[id].doc = undefined;
      this.notifySubscribers(id);
      delete this.employees[id];
      this.notifySubscribers();
    }
  }

  private pull = (id: string): void => {
    this.employees[id].doc = undefined;
    this.notifySubscribers(id);
    delete this.employees[id];
    this.notifySubscribers();
  }

  // Optimistic update
  addEmployee = (employee: Partial<IEmployee>, fn:()=>void): void => {
    const tempId = shortid.generate();
    const now = new Date();
    const newEmployee = new Employee({
      ...employee,
      _id: tempId,
      shifts: []
    });
    let newDoc: Doc = {
      doc: newEmployee,
      listeners: {}
    };
    this.employees[tempId] = newDoc;
    this.notifySubscribers();
    (axios as any).post(
      `${this.urls.employees}/new`,
      {name: employee.name, hourlyRate: employee.hourlyRate},
      this.getConfig()
    )
      .then(({data}) => {
        this.employees[data._id] = {
          doc: new Employee(data),
          listeners: this.employees[tempId].listeners
        };
        this.employees[tempId].listeners = {};
        this.pull(tempId);
        this.notifySubscribers(employee._id);
        this.notifySubscribers();
      })
      .catch(e => {
        console.error(e);
        this.pull(tempId);
        fn();
      });
  }

  // Optimistic update
  removeEmployee = (employee: Employee): void => {
  const oldEmployee: Doc = {...this.employees[employee._id]};
  this.pull(employee._id);
  (axios as any).delete(`${this.urls.employees}/${employee._id}`, this.getConfig())
    .catch(e => {
      console.error(e.message);
      this.employees[employee._id] = oldEmployee;
      this.notifySubscribers(employee._id);
      this.notifySubscribers();
    });
}

  // Optimistic update
  updateEmployee = (employee: Employee): void => {
  const oldEmployee: Employee = {...this.employees[employee._id].doc};
  this.put(employee);
  (axios as any).patch(`${this.urls.employees}/${employee._id}`, employee, this.getConfig())
    .then(({data}) => {
      this.put(data);
    })
    .catch(e => {
      console.error(e.message);
      this.put(oldEmployee, true);
    })
}

  getEmployee = (id: string) => (fn: Listener<Employee>): string => {
    const ident: string = shortid.generate();
    if(this.employees[id] && this.employees[id].doc) {
      fn(this.employees[id].doc);
      this.employees[id].listeners[ident] = fn;
    } else {
      this.employees[id] = {
        doc: undefined,
        listeners: {
          [ident]: fn
        }
      }
    }
    this.refreshEmployee(id);
    return ident;
  }

  getEmployees = (fn: Listener<Employee[]>): string => {
    const employees = Object.values(this.employees).map(em => em.doc.clone());
    fn(employees);
    const ident: string = shortid.generate();
    this.employeesListeners[ident] = fn;
    this.refreshEmployees();
    return ident;
  }

  refreshEmployee = (id: string): void => {
    (axios as any).get(`${this.urls.employees}/${id}`, this.getConfig())
      .then(({data}) => {
        this.put(data);
        if(this.shouldUpdate(data)) this.notifySubscribers();
      })
      .catch((e) => {
        console.error(e.message);
      });
  }

  refreshEmployees = (): void => {
    let didUpdate: boolean;
    (axios as any).get(`${this.urls.employees}`, this.getConfig())
      .then(({data}) => {
        data.employees.map((employee: Employee) => {
          if(this.employees[employee._id]) {
            didUpdate = this.put(employee) || didUpdate;
          } else {
            this.employees[employee._id] = {
              doc: new Employee(employee),
              listeners: {}
            }
            didUpdate = true
          }
        })
       if(didUpdate) this.notifySubscribers();
      })
      .catch(e => console.error(e.message));
  }

  private shouldUpdate = (employee: IEmployee):boolean =>
    (
      !this.employees[employee._id].doc ||
      employee.updatedAt !== this.employees[employee._id].doc.updatedAt
    );

  private notifySubscribers = (id?:string): void => {
    if(id) {
      const employee: Doc = this.employees[id];
      Object.values(employee.listeners).map(fn => fn(employee.doc));
    }
    else {
      const employees: Employee[] = Object.values(this.employees).map(em => em.doc);
      Object.values(this.employeesListeners).map(fn => fn(employees));
    }
  }

  private startShifts = (employeeIds: string[]): void => {
    const employees = Object.values(this.employees)
      .filter(i => employeeIds.includes(i.doc._id));

     // Optimistic update
     const shiftIds = employees.map(i =>
       ({employee: i.doc, shift: i.doc.startShift()})
     );
     employees.map(({doc}) => this.put(doc));
     this.notifySubscribers();

     (axios as any).post(`${this.urls.shifts}/start`, {employees: employeeIds}, this.getConfig())
      .then(({data}) => {
        data.employees.map(i => this.put(i));
        this.notifySubscribers();
      })
      .catch((e: Error) => {
        // Rollback
        console.error(e.message);
        shiftIds.map(i => {
          i.employee.removeShift(i.shift);
          this.notifySubscribers(i.employee._id);
        });
        this.notifySubscribers();
      })

  }

  startShift = (employees: string|string[]): void => {
    if(Array.isArray(employees)) return this.startShifts(employees);

    const id = employees as string;

    const employee = this.employees[id].doc;

    if(employee && this.SocketAPI && this.SocketAPI.active) return this.SocketAPI.startShift(employee._id);

    // Optimistic update
    let shiftId;
    try {
      shiftId = employee.startShift();
    } catch(e) {
      console.error(e.message);
      return;
    }
    this.put(employee);
    this.notifySubscribers();

    (axios as any).post(`${this.urls.shifts}/start`, {employees}, this.getConfig())
      .then(({data}) => {
        this.put(data);
        this.notifySubscribers();
      })
      .catch(e => {
        console.error(e.message);
        employee.removeShift(shiftId);
      });
  }

  private endShifts = (shifts: ShiftId[]): void => {
    const employeeIds = shifts.map(i => i.employee);
    const employees = shifts.map(shift => this.employees[shift.employee].doc);

    // Optimistic update
    employees.map(employee => {
      employee.endShift();
      this.put(employee)
    });
    this.notifySubscribers();

    (axios as any).post(`${this.urls.shifts}/end`, {shifts}, this.getConfig())
      .then(({data}) => {
        data.employees.map(employee => this.put(employee));
        this.notifySubscribers();
      })
      .catch(e => {
        console.error(e.message);
        employees.map(employee => {
          employee.restoreShift(shifts.filter(i=>i.employee==employee._id)[0].shift);
          this.put(employee);
        });
        this.notifySubscribers();
      })
  }

  endShift = (shifts: ShiftId|ShiftId[]): void => {
    if(Array.isArray(shifts)) return this.endShifts(shifts);

    const shiftId = shifts.shift;
    const employee = this.employees[shifts.employee].doc;

    if(employee && this.SocketAPI && this.SocketAPI.active) return this.SocketAPI.endShift(employee._id);

    // Optimistic update
    employee.endShift();
    this.put(employee);

    (axios as any).post(`${this.urls.shifts}/end`, {shifts}, this.getConfig())
      .then(({data}) => {
        this.put(data)
        this.notifySubscribers();
      })
      .catch((e: Error) => {
        console.error(e.message);
        employee.restoreShift(shiftId);
        this.put(employee);
        this.notifySubscribers();
      });
  }

  updateShift = (shift: ShiftId, start: Date, end: Date): void => {
    const employee = this.employees[shift.employee].doc.clone();
    const record = employee.shifts.filter(s => s._id === shift.shift)[0];
    if(!record) return console.error('Shift not found');

    record.start = start;
    record.end = end;

    if(this.SocketAPI && this.SocketAPI.active)
      return this.SocketAPI.updateShift(employee, record);

    (axios as any).patch(`${this.urls.shifts}/${shift.employee}/${shift.shift}`)
      .then(({data}) => {
        const shift = new Shift(data.shift);
        if(!(
          shift.start.getTime() == start.getTime() &&
          shift.end.getTime() == end.getTime()
        )) return console.error('something went wrong');
        employee.updatedAt = new Date();
        this.put(employee);
        this.notifySubscribers();
      })
  }

  unsubscribe = (id:string): void => {
    if(this.employeesListeners[id]) delete this.employeesListeners[id];
    else if(this.loginListeners[id]) delete this.loginListeners[id];
    else if(this.WSListeners[id]) delete this.WSListeners[id];
    else {
      Object.values(this.employees).map(em => (em.listeners[id] && delete em.listeners[id]));
    }
  }
}
