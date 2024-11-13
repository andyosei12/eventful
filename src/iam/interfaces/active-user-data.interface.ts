import { Types } from 'mongoose';
import { Role } from 'src/users/enums/role.enum';

export interface ActiveUserData {
  sub: Types.ObjectId;
  phone_number: string;
  role: Role;
}
