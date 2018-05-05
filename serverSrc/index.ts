import * as express from 'express';
import * as expressStatic from 'express-static-gzip';
import db from './model/index';
import * as handlers from './controller/index';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as http from 'http';

// import * as io from 'socket.io';
import * as socketHandler from './sockets/handlers';

db();

const app = express();
const server = new http.Server(app);

const socket = require('socket.io')(server);

require('socketio-auth')(socket, {
  authenticate: socketHandler.authenticate,
  disconnect: socketHandler.disconnect,
  postAuthenticate: (socket) => {
    console.log(`${new Date().toUTCString()}: ${socket.user.username} connected via WebSocket`);
    socket.on('startShift', socketHandler.startShift(socket));
    socket.on('endShift', socketHandler.endShift(socket));
    socket.on('updateShift', socketHandler.updateShift(socket));
  }
});
export default socket;

app.set('trust proxy', ['loopback', '192.168.5.2'])

app.use(bodyParser.json());

app.use(handlers.logger);

app.use('/', expressStatic(path.resolve(__dirname, 'static')));
app.get(/^\/((?!(api|socket\.io)).)/, (req, res) =>
  res.sendFile(path.resolve(__dirname, 'static/index.html')));

app.post('/api/login', handlers.login);
app.use('/api', handlers.verifyToken);
app.post('/api/adduser', handlers.newUser);
app.get('/api/employees/:id', handlers.getEmployee);
app.get('/api/employees', handlers.getEmployees);
app.post('/api/employees/new', handlers.addEmployee);
app.patch('/api/employees/:id', handlers.updateEmployee);
app.delete('/api/employees/:id', handlers.deleteEmployee);
app.post('/api/shifts/start', handlers.newShift);
app.post('/api/shifts/end', handlers.endShift);
app.patch('/api/shifts/:employee/:shift', handlers.updateShift);




server.listen(process.env.PORT || 5000, () =>
  console.log(`Server Started at ${new Date().toLocaleTimeString()}`));
