import Model from './index';
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

  private onDisconnect = () => {
    this.active = false;
    this.model.updateWS();
    console.log('Websocket connection lost');
  }
}
