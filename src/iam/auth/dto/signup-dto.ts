import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'drew',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    example: 'Osei',
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    example: 'drew@mail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password must be at least 8 characters long',
    example: 'Hello123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: ['creator', 'regular'], default: 'regular' })
  @IsEnum(['creator', 'regular'])
  @IsOptional()
  role: string;
}
