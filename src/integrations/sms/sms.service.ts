import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface Sms {
  phoneNumber: string;
  sender: string;
  body: string;
}

@Injectable()
export class SmsService {
  constructor(private configService: ConfigService) {}

  async sendSms({ phoneNumber, sender, body }: Sms) {
    try {
      await fetch('https://sms.arkesel.com/api/v2/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.configService.get<string>('ARKESEL_API'),
        },
        body: JSON.stringify({
          sender: 'Efiada',
          recipients: [phoneNumber],
          message: body,
        }),
      });

      console.log('Message sent');
    } catch (err) {
      console.log(err);
    }
  }
}
