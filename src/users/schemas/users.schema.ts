import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  role: String,
  created_at: { type: Date, default: Date.now },
});
