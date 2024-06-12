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
import getDateBeforeEvent from '../utils/getDateBeforeEvent';
import { Event } from '../events/schemas/event.schema';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { Teller } from 'src/users/schemas/tellers.schema';
import { User } from 'src/users/schemas/users.schema';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Teller.name) private readonly tellerModel: Model<Teller>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createTicketDto: CreateTicketDto, user_id: Types.ObjectId) {
    // find the event date asociated with the ticket
    const event = await this.eventModel.findById(
      { _id: createTicketDto.event_id },
      'date creator_id',
    );
    const eventCreatorId = event.creator_id;

    const ticket = new this.ticketModel({
      user_id,
      event_id: createTicketDto.event_id,
      creator_id: eventCreatorId,
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

  async update(ticketId: string, user: ActiveUserData) {
    // Check the role of the user
    let creator_id: Types.ObjectId;

    if (user.role === 'creator') {
      creator_id = user.sub;
    } else if (user.role === 'teller') {
      const teller = await this.tellerModel.findOne({
        user_id: new Types.ObjectId(user.sub),
      });
      creator_id = teller.creator_id;
    }

    // Check if the ticket exists
    const ticket = await this.ticketModel.findOne({
      _id: ticketId,
      creator_id,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const event = await this.eventModel.findOne({
      _id: ticket.event_id,
    });
    const ticketHolder = await this.userModel.findById(ticket.user_id);
    const userName = ticketHolder.first_name + ' ' + ticketHolder.last_name;

    if (ticket.status === Status.Completed) {
      // throw new ConflictException('Ticket has already been scanned or used');
      return {
        message: 'Ticket has already been scanned',
        event: event.title,
        user: userName,
      };
    }

    // Update the ticket status
    await this.ticketModel.updateOne(
      { _id: ticketId },
      { status: Status.Completed },
    );

    return {
      message: `Access granted for ${event.title}`,
      event: event.title,
      user: userName,
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
