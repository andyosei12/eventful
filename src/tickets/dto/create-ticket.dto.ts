import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '../enums/status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({
    description: 'The id of an event',
  })
  @IsString()
  event_id: string;

  @ApiProperty({
    description: 'The current status of the event',
    default: Status.Pending,
    enum: Status,
  })
  @IsOptional()
  status: Status;
}
