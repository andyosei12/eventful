import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Title of the event',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the event',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The date the event will take place',
  })
  @IsDate()
  date: Date;

  @ApiProperty()
  image: File;

  @ApiProperty({
    description: 'The time event will take place',
  })
  @IsString()
  time: string;

  @ApiProperty({
    description: 'The price of the event',
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Location of the event',
  })
  @IsString()
  location: string;

  @ApiProperty({
    description:
      'This is the number of days before the event on which to notify eventees',
    default: 1,
  })
  @IsNumber()
  days_before: number;
}
