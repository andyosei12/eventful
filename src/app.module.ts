import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { QrCodeModule } from './qr_code/qr_code.module';
import { TaskService } from './notifications/task.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    MongooseModule.forRoot(`${process.env.MONGODB_URL}`),
    UsersModule,
    IamModule,
    EventsModule,
    TicketsModule,
    AnalyticsModule,
    QrCodeModule,
  ],
  controllers: [AppController],
  providers: [AppService, TaskService],
})
export class AppModule {}
