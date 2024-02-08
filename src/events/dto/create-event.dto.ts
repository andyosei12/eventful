import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDate()
  date: Date;

  @IsNumber()
  price: number;

  @IsString()
  location: string;

  @IsNumber()
  daysBefore: number;
}
