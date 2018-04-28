import * as io from 'socket.io';
import ioauth from 'socketio-auth';

import server from '../index';
import * as handler from './handlers';

const webSocket = io(server);
export default webSocket;

ioauth(webSocket, {
  authenticate: handler.authenticate,
  postAuthenticate: (socket) => {
    console.log(`${socket.user.username} connected via WebSocket`);
    socket.on('startShift', handler.startShift(socket));
    socket.on('endShift', handler.endShift(socket));
    socket.on('disconnected', ()=> console.log(`${socket.user} disconnected`));
  }
});
