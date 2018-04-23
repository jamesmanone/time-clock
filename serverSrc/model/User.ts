import {
  model,
  Schema,
  Types,
  Document,
  Model,
  DocumentQuery,
} from 'mongoose';

import * as bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  passhash: string;
}

const user: Schema = new Schema({
  username: {
    type: String,
    required: true
  },
  passhash: {
    type: String,
    required: true
  }
});

const User: Model<IUser> = model<IUser>('user', user);

export default User;

export const findById = (id: string): DocumentQuery<IUser, IUser> =>
  User.findById(id);

export const byUsername = (username: string): Promise<IUser> => {
  return User.find({username})
    .then(users => {
      if(!users) return undefined;
      return users[0];
    })
    .catch(() => undefined);
};

export const addUser = (user: Partial<IUser>): IUser => {
  if(!(user && user.username && user.passhash)) return undefined;
  const newUser: IUser = new User(user);
  newUser.passhash = bcrypt.hashSync(newUser.passhash, 10);
  newUser.save();
  User.findOne({username: 'root'})
    .then(root => {
      if(root) root.remove();
    });
  return newUser;
};

export const checkPassword = (candidate: string, passhash: string): boolean =>
  bcrypt.compareSync(candidate, passhash);
