import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './schemas/event.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}
  create(createEventDto: CreateEventDto, creatorId: Types.ObjectId) {
    const createdEvent = new this.eventModel(createEventDto);
    createdEvent.creator_id = creatorId;
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
        return new NotFoundException(`Event with ${error.path} not found`);
      }
    }
  }

  findCreatorEvents(creatorId: Types.ObjectId) {
    return this.eventModel.find({ creator_id: creatorId }).exec();
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    try {
      return await this.eventModel
        .findByIdAndUpdate(id, updateEventDto, { new: true })
        .exec();
    } catch (error) {
      if (error.name === 'CastError') {
        return new NotFoundException(`Event with ${error.path} not found`);
      }
    }
  }

  async remove(id: string) {
    try {
      return await this.eventModel.deleteOne({ _id: id }).exec();
    } catch (error) {
      if (error.name === 'CastError') {
        return new NotFoundException(`Event with ${error.path} not found`);
      }
    }
  }
}
