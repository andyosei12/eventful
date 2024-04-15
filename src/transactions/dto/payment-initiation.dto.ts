import { IsString } from 'class-validator';

export class PaymentInitiationDto {
  @IsString()
  eventId: string;
}
