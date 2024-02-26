import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TicketSchema } from 'src/tickets/schemas/tickets.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from 'src/events/schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Ticket', schema: TicketSchema },
      { name: 'Event', schema: EventSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
