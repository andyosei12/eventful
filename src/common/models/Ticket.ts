import { ApiProperty } from '@nestjs/swagger';

export class TicketQrCode {
  @ApiProperty()
  qr_code: string;
}

export class Ticket {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  event_id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  status: string;
}
