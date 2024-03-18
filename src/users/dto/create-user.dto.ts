import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Drew',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    example: 'Osei',
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    example: 'andy@mail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'hello123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: ['creator', 'regular'], default: 'regular' })
  @IsEnum(['creator', 'regular'])
  @IsOptional()
  role: string;
}
