import * as mongoose from 'mongoose';
import * as Model from './Employee';
import User, { addUser } from './User';

mongoose.connect
let db;

export default (): void => {
  mongoose.connect('mongodb://localhost:27017/time-clock').then(() => {
    db = mongoose.Connection;

    console.log('db up');
    User.find()
      .then(users => {
        if(!(users && users.length)) {
          addUser({username:'root',passhash:'password'})
        } else if(users.length > 1) {
          User.findOne({username: 'root'})
            .then(root => {
              if(root) root.remove();
            });
        }
      });
    return db;
  });
}

export const model = Model;
