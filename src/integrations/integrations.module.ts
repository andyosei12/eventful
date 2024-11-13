import { Module } from '@nestjs/common';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailService } from './mail/mail.service';
import { ConfigModule } from '@nestjs/config';
import { SmsService } from './sms/sms.service';

@Module({
  imports: [CloudinaryModule, ConfigModule],
  providers: [MailService, SmsService],
})
export class IntegrationsModule {}
