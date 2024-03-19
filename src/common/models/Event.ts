import { ApiProperty } from '@nestjs/swagger';

export class Event {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  time: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  location: string;

  @ApiProperty()
  reminder_date: Date;

  @ApiProperty()
  days_before: number;
}
