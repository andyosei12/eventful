import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Model, Types } from 'mongoose';
import * as QRCode from 'qrcode';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket } from './schemas/tickets.schema';
import { Status } from './enums/status.enum';
import getDateBeforeEvent from 'src/utils/getDateBeforeEvent';
import { Event } from 'src/events/schemas/event.schema';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  async create(createTicketDto: CreateTicketDto, user_id: Types.ObjectId) {
    // find the event date asociated with the ticket
    const event = await this.eventModel.findById(
      { _id: createTicketDto.event_id },
      'date creator_id',
    );
    const eventDate = event.date;
    const eventCreatorId = event.creator_id;

    const reminderDate = getDateBeforeEvent(
      eventDate,
      createTicketDto.daysBefore,
    );
    const ticket = new this.ticketModel({
      user_id,
      event_id: createTicketDto.event_id,
      creator_id: eventCreatorId,
      reminder_date: reminderDate,
    });

    const ticketId = ticket._id.toString();
    let url: string;

    // Generate QR code
    try {
      url = await QRCode.toDataURL(`${ticketId}`);
      await ticket.save();
    } catch (err) {
      throw new HttpException(
        'Error while generating QR code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return {
      qr_code: url,
    };
  }

  findAll() {
    return `This action returns all tickets`;
  }

  findCompletedTickets(
    paginationQuery: PaginationQueryDto,
    user_id: Types.ObjectId,
  ) {
    const page = paginationQuery.page * 1 || 1;
    const limit = paginationQuery.limit * 1 || 20;
    const skip = (page - 1) * limit;
    // make a join with the events collection
    return this.ticketModel
      .aggregate([
        {
          $match: {
            user_id,
            status: Status.Completed,
          },
        },
        { $set: { event_id: { $toObjectId: '$event_id' } } },
        {
          $lookup: {
            from: 'events',
            localField: 'event_id',
            foreignField: '_id',
            as: 'event',
          },
        },
        {
          $unwind: '$event',
        },
        {
          $project: {
            _id: 1,
            event: 1,
            status: 1,
          },
        },
      ])
      .skip(skip)
      .limit(limit)
      .exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} ticket`;
  }

  findUserTickets(
    user_id: Types.ObjectId,
    paginationQuery: PaginationQueryDto,
  ) {
    const page = paginationQuery.page * 1 || 1;
    const limit = paginationQuery.limit * 1 || 20;
    const skip = (page - 1) * limit;
    // make a join with the events collection
    return this.ticketModel
      .aggregate([
        {
          $match: {
            user_id,
          },
        },
        { $set: { event_id: { $toObjectId: '$event_id' } } },
        {
          $lookup: {
            from: 'events',
            localField: 'event_id',
            foreignField: '_id',
            as: 'event',
          },
        },
        {
          $unwind: '$event',
        },
        {
          $project: {
            _id: 1,
            event: 1,
            status: 1,
            reminder_date: 1,
          },
        },
      ])
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async update(ticketId: string, user_id: Types.ObjectId) {
    // Check if the ticket exists
    const ticket = await this.ticketModel.findOne({
      _id: ticketId,
      creator_id: user_id,
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    } else if (ticket.status === Status.Completed) {
      throw new ConflictException('Ticket has already been scanned or used');
    }
    // Check if the user is the creator of the event
    const event = await this.eventModel.findOne({
      _id: ticket.event_id,
    });

    // Update the ticket status
    await this.ticketModel.updateOne(
      { _id: ticketId },
      { status: Status.Completed },
    );

    return {
      message: `Access granted for ${event.title}`,
    };
  }

  async remove(id: number) {
    try {
      return await this.ticketModel.deleteOne({ _id: id }).exec();
    } catch (error) {
      if (error.name === 'CastError') {
        throw new NotFoundException(`Event with ${error.path} not found`);
      }
    }
  }
}
