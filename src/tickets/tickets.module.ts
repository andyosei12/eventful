import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketSchema } from './schemas/tickets.schema';
import { EventSchema } from 'src/events/schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Ticket', schema: TicketSchema },
      { name: 'Event', schema: EventSchema },
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
