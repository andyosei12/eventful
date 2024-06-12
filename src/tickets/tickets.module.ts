import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketSchema } from './schemas/tickets.schema';
import { EventSchema } from 'src/events/schemas/event.schema';
import { TellerSchema } from 'src/users/schemas/tellers.schema';
import { UserSchema } from 'src/users/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Ticket', schema: TicketSchema },
      { name: 'Event', schema: EventSchema },
      { name: 'Teller', schema: TellerSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
