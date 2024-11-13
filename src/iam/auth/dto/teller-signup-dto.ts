import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from 'src/users/enums/role.enum';

export class TellerDto {
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
    example: '0200XXXXXXX',
  })
  @IsString()
  phone_number: string;

  @ApiProperty({
    description: 'Password must be at least 8 characters long',
    example: 'Hello123',
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password: string;

  @ApiProperty({ example: 'teller' })
  @IsString()
  @IsOptional()
  role: Role.Teller;
}
