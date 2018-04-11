import * as mongoose from 'mongoose';
import * as model from './Employee'

export default function() {
  return mongoose.connect('mongodb://localhost:27017')
}

export model;