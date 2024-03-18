import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface Mail {
  email: string;
  name: string;
  event: string;
  date: Date;
  time: string;
}

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}

  private readonly transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: this.configService.get<string>('EMAIL_USERNAME'),
      pass: this.configService.get<string>('EMAIL_PASSWORD'),
    },
  });

  async sendMail({ email, name, event, date, time }: Mail) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Efiada Inc" <nanaosei2089@gmail.com>', // sender address
        to: email, // receiver address
        subject: `Reminder: ${event}`, // Subject line
        // plain text body
        html: `
      <h3>Hi ${name}<h3/>
      <p>You are reminded of the event, ${event} which is scheduled on ${date.toDateString()} at ${time}.</p>
      <p>You can visit your dashboard to find your QR code</p>
      <p>Thank you</p>
      `, // html body
      });

      console.log('Message sent: %s', info.messageId);
    } catch (err) {
      console.log(err);
    }
  }
}
