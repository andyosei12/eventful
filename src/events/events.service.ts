import { rm } from 'fs';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './schemas/event.schema';
import { Model, Types } from 'mongoose';
import getDateBeforeEvent from '../utils/getDateBeforeEvent';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

type EventData = {
  _id: Types.ObjectId;
  title: string;
  description: string;
  date: Date;
  reminder_date: Date;
  price: number;
  days_before: string;
};

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async create(
    createEventDto: CreateEventDto,
    image_path: string,
    creatorId: Types.ObjectId,
  ) {
    const reminderDate = getDateBeforeEvent(
      createEventDto.date,
      createEventDto.days_before,
    );

    const createdEvent = new this.eventModel(createEventDto);
    createdEvent.creator_id = creatorId;
    createdEvent.reminder_date = reminderDate;
    return await this.cloudinaryService
      .uploadImage(image_path)
      .then((res) => {
        createdEvent.image_secure_url = res.secure_url;
        createdEvent.image_public_id = res.public_id;
        return createdEvent.save();
      })
      .catch((err) => {
        console.log(err);
        throw new Error('Something went wrong');
      })
      .finally(() => {
        rm(image_path, (err) => {
          if (err) console.log(err);
        });
      });
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const page = paginationQuery?.page * 1 || 1;
    const limit = paginationQuery?.limit * 1 || 20;
    const skip = (page - 1) * limit;
    return this.eventModel.find().skip(skip).limit(limit).exec();
  }

  async findOne(id: string): Promise<EventData> {
    try {
      const value: EventData | undefined = await this.cacheManager.get(id);

      if (value) {
        return value;
      }
      const event: EventData = await this.eventModel.findById(id).exec();

      // caching the event for 24 hours
      await this.cacheManager.set(id, event, 86400000);
      return event;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new NotFoundException(`Event with ${error.path} not found`);
      }
    }
  }

  findCreatorEvents(
    creatorId: Types.ObjectId,
    paginationQuery: PaginationQueryDto,
  ) {
    const page = paginationQuery.page * 1 || 1;
    const limit = paginationQuery.limit * 1 || 20;
    const skip = (page - 1) * limit;
    return this.eventModel
      .find({ creator_id: creatorId })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    // this logic is to update the reminder date if the days_before is updated
    let reminderDate;
    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    if (updateEventDto.days_before && !updateEventDto.date) {
      // find the event and get the date
      const date = event.date;
      reminderDate = getDateBeforeEvent(date, updateEventDto.days_before);
    }

    if (updateEventDto.days_before && updateEventDto.date) {
      reminderDate = getDateBeforeEvent(
        updateEventDto.date,
        updateEventDto.days_before,
      );
    }

    try {
      const updatedEvent = await this.eventModel
        .findByIdAndUpdate(
          id,
          {
            ...updateEventDto,
            reminder_date: reminderDate || event.reminder_date,
          },
          { new: true },
        )
        .exec();
      await this.cacheManager.del(id);
      return updatedEvent;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new NotFoundException(`Event with ${error.path} not found`);
      }
    }
  }

  async remove(id: string) {
    try {
      return await this.eventModel.deleteOne({ _id: id }).exec();
    } catch (error) {
      if (error.name === 'CastError') {
        throw new NotFoundException(`Event with ${error.path} not found`);
      }
    }
  }
}
