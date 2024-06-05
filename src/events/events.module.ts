import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventSchema } from './schemas/event.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { CloudinaryService } from 'src/integrations/cloudinary/cloudinary.service';
import { ConfigModule } from '@nestjs/config';
import cloudinaryConfig from 'src/integrations/cloudinary/config/cloudinary.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    CacheModule.register(),
    ConfigModule.forFeature(cloudinaryConfig),
  ],
  controllers: [EventsController],
  providers: [EventsService, CloudinaryService],
})
export class EventsModule {}
