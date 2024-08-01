import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { nanoid } from 'nanoid';
import { Event } from 'src/events/schemas/event.schema';
import { Status } from 'src/tickets/enums/status.enum';
import { Ticket } from 'src/tickets/schemas/tickets.schema';
import { Wallet } from 'src/transactions/schemas/wallets.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
    @InjectModel(Event.name) private readonly eventModel: Model<any>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
  ) {}

  getTotalEvents(creator_id: Types.ObjectId) {
    return this.eventModel.countDocuments({ creator_id });
  }

  getTicketsSold(creator_id: Types.ObjectId) {
    return this.ticketModel.countDocuments({ creator_id });
  }

  getCompletedTickets(creator_id: Types.ObjectId) {
    return this.ticketModel.countDocuments({
      creator_id,
      status: Status.Completed,
    });
  }

  getTicketsSoldByEvent(eventId: string, creator_id: Types.ObjectId) {
    return this.ticketModel.countDocuments({ creator_id, event_id: eventId });
  }

  getCompletedTicketsByEvent(eventId: string, creator_id: Types.ObjectId) {
    return this.ticketModel.countDocuments({
      creator_id,
      event_id: eventId,
      status: Status.Completed,
    });
  }

  //   Get revenue for a creator by joining the tickets and events collections
  // getRevenue(creator_id: Types.ObjectId) {
  //   return this.ticketModel.aggregate([
  //     {
  //       $match: {
  //         creator_id,
  //       },
  //     },
  //     { $set: { event_id: { $toObjectId: '$event_id' } } },
  //     {
  //       $lookup: {
  //         from: 'events',
  //         localField: 'event_id',
  //         foreignField: '_id',
  //         as: 'event',
  //       },
  //     },
  //     {
  //       $unwind: '$event',
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         total: {
  //           $sum: '$event.price',
  //         },
  //       },
  //     },
  //   ]);
  // }

  async getRevenue(creator_id: Types.ObjectId) {
    const revenue = await this.walletModel.find({ user_id: creator_id });
    const balance = +revenue[0]?.balance.toFixed(2);
    return {
      balance: balance || 0,
    };
  }

  getRevenueByEvent(eventId: string, creator_id: Types.ObjectId) {
    return this.ticketModel.aggregate([
      {
        $match: {
          creator_id,
          event_id: eventId,
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
        $group: {
          _id: '$event.title',
          total: {
            $sum: '$event.price',
          },
        },
      },
    ]);
  }
}
