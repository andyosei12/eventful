import { Document } from 'mongoose';

export interface User extends Document {
  readonly first_name: string;
  readonly last_name: string;
  readonly phone_number: string;
  readonly password: string;
  readonly role: string;
  readonly created_at: Date;
}
