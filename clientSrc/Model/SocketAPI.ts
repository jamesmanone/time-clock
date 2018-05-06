import Model from './index';
import Employee from './Employee';
import Shift, { IShift } from './Shift';
import io from 'socket.io-client';
import * as JWT from 'jwt-client';

export interface ISocketAPI {
  authenticate: ()=>void;
  startShift: (_id:string,start?:Date)=>void;
  endShift: (_id:string,end?:Date)=>void;
  active: boolean;
}

export default class SocketAPI implements ISocketAPI {
  private socket;
  active: boolean;
  model: Model;

  constructor(model: Model) {
    this.model = model;
    this.socket = io();
    this.socket.on('start shift', this.onStart);
    this.socket.on('end shift', this.onEnd);
    this.socket.on('update shift', this.onUpdate);
    this.socket.on('update employee', this.onUpdateEmployee);
    this.socket.on('new employee', this.onNewEmployee);
    this.socket.on('connect', this.authenticate);
    this.socket.on('authenticated', this.authenticated);
    this.socket.on('disconnect', this.onDisconnect);
    this.socket.on('404', ()=> console.error('Request Not Fount'));
    this.socket.on('400', ()=> console.error('Bad Request'));
  }

  authenticate = (): void => {
    console.log('socket connected');
    this.socket.emit('authentication', {token: JWT.get()})
  }

  authenticated = (): void => {
    console.log('authenticated');
    this.active = true;
    this.model.updateWS();
  };

  startShift = (_id: string, start?: Date): void => {
    this.socket.emit('startShift', {_id, start});
  };

  endShift = (_id: string, end?: Date): void => {
    this.socket.emit('endShift', {_id, end});
  };

  updateShift = (employee: Employee, shift: Shift): void => {
    this.socket.emit('updateShift', {employee: employee._id, shift});
  }

  private onStart = (data: any): void => {
    const shift = new Shift(data.shift);
    const employee = this.model.findById(data.employee);
    if(!employee.activeShift) {
      employee.shifts.push(shift);
      employee.activeShift = shift;
      employee.updatedAt = new Date(data.updatedAt);
      this.model.putFromWS(employee);
    }
  };

  private onEnd = (data): void => {
    const shift = new Shift(data.shift);
    const employee = this.model.findById(data._id);
    if(employee.activeShift) {
      employee.shifts = [
        ...employee.shifts.filter(i => i._id !== shift._id),
        shift
      ];
      employee.activeShift = undefined;
      employee.updatedAt = new Date(data.updatedAt);
      this.model.putFromWS(employee);
    }
  }

  private onUpdate = (data): void => {
    // debugger;
    const shift = new Shift(data.shift);
    const employee = this.model.findById(data.employee);
    employee.shifts = employee.shifts.map(s => {
      if(s._id === shift._id) return shift;
      return s;
    });
    this.model.putFromWS(employee);
  }

  private onDisconnect = () => {
    this.active = false;
    this.model.updateWS();
    console.log('Websocket connection lost');
  }

  private onNewEmployee = (data: Employee): void => {
    this.model.upsertFromWS(new Employee (data));
  }

  private onUpdateEmployee = (data: Employee): void => {
    const { _id } = data;
    const record = this.model.findById(_id);

    // Hackish way to grab missing employee
    if(!record) return this.model.unsubscribe(this.model.getEmployee(_id)((e)=>undefined));
    // if((record.updatedAt as Date).getTime() === new Date(data.updatedAt).getTime()) return;

    Object.keys(data).map(k => {
      if(k !== 'shifts') record[k] = data[k]
    });
    this.model.upsertFromWS(record);
  }

  private onDeleteEmployee = (data: string) => {
    this.model.deleteFromWS(data);
  }
}
