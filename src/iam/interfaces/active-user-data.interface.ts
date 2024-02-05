import { Types } from 'mongoose';

export interface ActiveUserData {
  sub: Types.ObjectId;
  email: string;
  role: string;
}
