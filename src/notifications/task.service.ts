import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Event } from 'src/events/schemas/event.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket } from 'src/tickets/schemas/tickets.schema';
import { User } from 'src/users/schemas/users.schema';
import { MailService } from 'src/integrations/mail/mail.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailService: MailService,
  ) {}
  private readonly logger = new Logger(TaskService.name);

  async sendEventeesReminder() {
    const currentDate = new Date();
    // fetch events whose reminder_date is today
    const events = await this.eventModel.find({
      $expr: {
        $and: [
          { $eq: [{ $month: '$reminder_date' }, currentDate.getMonth() + 1] },
          { $eq: [{ $dayOfMonth: '$reminder_date' }, currentDate.getDate()] },
          { $eq: [{ $year: '$reminder_date' }, currentDate.getFullYear()] },
        ],
      },
    });

    if (events.length === 0) {
      return;
    }

    // loop through the events and find tickets that match the event id and get the user of the ticket
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const tickets = await this.ticketModel.find({
        event_id: event._id.toString(),
      });
      if (tickets.length === 0) {
        return;
      }
      for (let j = 0; j < tickets.length; j++) {
        const ticket = tickets[j];
        const user = await this.userModel.findById(ticket.user_id);
        if (!user) {
          return;
        }
        // send mail to user
        //   this.mailService.sendMail({
        //     email: user.email,
        //     subject: `Reminder: ${event.title}`,
        //     body: `<h3>Hi ${user.first_name}<h3/>
        // <p>You are reminded of the event, ${event} which is scheduled on ${event.date.toDateString()} at ${event.time}.</p>
        // <p>You can visit your dashboard to find your QR code</p>
        // <p>Thank you</p>`,
        //   });
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleCron() {
    await this.sendEventeesReminder();
  }
}
