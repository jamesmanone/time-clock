import * as express from 'express';
import db from './model/index';
import * as handlers from './controller/index';
import * as path from 'path';
import * as bodyParser from 'body-parser';

db();

const app = express();
app.set('trust proxy', ['uniquelocal', '192.168.5.1'])

app.use(bodyParser.json());

app.use(handlers.logger);

app.use(express.static('./static'));
app.get(/^\/((?!api).)/, (req, res) =>
  res.sendFile(path.resolve(__dirname, 'static/index.html')));

app.post('/api/login', handlers.login);
app.use(handlers.verifyToken)
app.post('/api/adduser', handlers.newUser);
app.get('/api/employees/:id', handlers.getEmployee);
app.get('/api/employees', handlers.getEmployees);
app.post('/api/employees/new', handlers.addEmployee);
app.patch('/api/employees/:id', handlers.updateEmployee);
app.delete('/api/employees/:id', handlers.deleteEmployee);
app.post('/api/shifts/start', handlers.newShift);
app.post('/api/shifts/end', handlers.endShift);

app.listen(process.env.port || 5000, () =>
  console.log(`Server Started at ${new Date().toLocaleTimeString()}`));
