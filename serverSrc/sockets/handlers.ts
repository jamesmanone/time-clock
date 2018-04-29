import * as User from '../model/User';
import * as Employee from '../model/Employee';
import * as jwt from 'jsonwebtoken';
import io from '../index';

const secret: string = 'jumppinjehosaphat';

interface ISocket extends SocketIO.Socket {
  user: User.IUser
}

export const authenticate = (socket: ISocket, data: {token:string}, fn) => {
  let token;
  try {
    token = jwt.verify(data.token, secret);
    User.findById(token.id)
      .then((user: User.IUser) => {
        if(!user) throw Error('Bad Token');
        (socket as any).user = user;
        fn(null, true);
      })
      .catch(e => fn(e));
  } catch (e) {
    fn(e);
  }
}

export const startShift = (socket: SocketIO.Socket) => (data) => {
  console.log(data._id)
  Employee.startShift(data._id)
    .then(employee => {
      if(!employee) socket.emit('404');
      else io.emit('start shift', {
        employee: employee._id,
        shift: employee.activeShift,
        updatedAt: employee.updatedAt
      });
    })
    .catch(e => socket.emit('400'));
}

export const endShift = (socket: SocketIO.Socket) => (data) => {
  Employee.stopShift(data._id, data.end)
    .then(({_id, shift, updatedAt}) => {
      if(!shift) socket.emit('404');
      else io.emit('end shift', {_id, updatedAt, shift});
    })
    .catch(e => socket.emit('400'));
}
