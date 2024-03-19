import { ApiProperty } from '@nestjs/swagger';
import { User } from './User';

export class AuthUser extends User {
  @ApiProperty()
  accessToken: string;
}
