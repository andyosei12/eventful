import { IsDate, IsNumber, IsString, isString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDate()
  date: Date;

  @IsString()
  time: string;

  @IsNumber()
  price: number;

  @IsString()
  location: string;

  @IsNumber()
  days_before: number;
}
