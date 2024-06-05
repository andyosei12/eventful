import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { Event, EventSchema } from 'src/events/schemas/event.schema';
import { Ticket, TicketSchema } from 'src/tickets/schemas/tickets.schema';
import { MailService } from 'src/integrations/mail/mail.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
  ],
  providers: [TaskService, MailService],
})
export class TaskModule {}
