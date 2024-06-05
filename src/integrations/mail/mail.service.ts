import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface Mail {
  email: string;
  body: string;
  subject: string;
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

  async sendMail({ email, body, subject }: Mail) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Efiada Inc" <nanaosei2089@gmail.com>', // sender address
        to: email, // receiver address
        subject, // Subject line
        // plain text body
        html: body, // html body
      });

      console.log('Message sent: %s', info.messageId);
    } catch (err) {
      console.log(err);
    }
  }
}
