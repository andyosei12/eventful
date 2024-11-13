import {
  IsEnum,
  IsNumber,
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
  @IsString()
  phone_number: string;

  @ApiProperty({
    example: 'hello123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: ['creator', 'regular', 'teller'], default: 'regular' })
  @IsEnum(['creator', 'regular', 'teller'])
  @IsOptional()
  role: string;
}
