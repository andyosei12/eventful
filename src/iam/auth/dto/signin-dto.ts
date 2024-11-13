import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SigninDto {
  @ApiProperty({
    description: 'Phone number used during registration',
  })
  @IsString()
  phone_number: string;

  @ApiProperty({
    description: 'Password associated with email',
  })
  @IsString()
  password: string;
}
