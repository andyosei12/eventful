import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class User {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
