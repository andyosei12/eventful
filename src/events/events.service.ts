import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './schemas/event.schema';
import { Model, Types } from 'mongoose';
import getDateBeforeEvent from 'src/utils/getDateBeforeEvent';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}
  create(createEventDto: CreateEventDto, creatorId: Types.ObjectId) {
    const reminderDate = getDateBeforeEvent(
      createEventDto.date,
      createEventDto.days_before,
    );

    const createdEvent = new this.eventModel(createEventDto);
    createdEvent.creator_id = creatorId;
    createdEvent.reminder_date = reminderDate;
    return createdEvent.save();
  }

  findAll() {
    return this.eventModel.find().exec();
  }

  async findOne(id: string) {
    try {
      const event = await this.eventModel.findById(id).exec();
      return event;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new NotFoundException(`Event with ${error.path} not found`);
      }
    }
  }

  findCreatorEvents(creatorId: Types.ObjectId) {
    return this.eventModel.find({ creator_id: creatorId }).exec();
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
    } else {
      reminderDate = getDateBeforeEvent(
        updateEventDto.date,
        updateEventDto.days_before,
      );
    }

    try {
      return await this.eventModel
        .findByIdAndUpdate(
          id,
          {
            ...updateEventDto,
            reminder_date: reminderDate || event.reminder_date,
          },
          { new: true },
        )
        .exec();
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
