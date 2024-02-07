import {
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

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto, user_id: Types.ObjectId) {
    const ticket = new this.ticketModel({
      user_id,
      event_id: createTicketDto.event_id,
    });

    const ticketId = ticket._id.toString();
    let url: string;

    // Generate QR code
    try {
      url = await QRCode.toDataURL(ticketId);
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

  findOne(id: number) {
    return `This action returns a #${id} ticket`;
  }

  async update(id: string, user_id: Types.ObjectId) {
    // Check if the ticket exists and has not been used
    const ticket = await this.ticketModel.findOne({
      _id: id,
      status: Status.Pending,
      user_id,
    });
    if (!ticket) {
      return new NotFoundException('Ticket not found or has been used');
    }
    return this.ticketModel.updateOne(
      { _id: id },
      { status: Status.Completed },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
