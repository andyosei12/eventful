import { Types } from 'mongoose';
import { Role } from 'src/users/enums/role.enum';

export interface ActiveUserData {
  sub: Types.ObjectId;
  email: string;
  role: Role;
}
