import { IsOptional, IsString } from 'class-validator';
import { Status } from '../enums/status.enum';

export class CreateTicketDto {
  @IsString()
  event_id: string;

  @IsOptional()
  status: Status;
}
