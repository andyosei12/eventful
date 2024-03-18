import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SigninDto {
  @ApiProperty({
    description: 'Email used during registration',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password associated with email',
  })
  @IsString()
  password: string;
}
