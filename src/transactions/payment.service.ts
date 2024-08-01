import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { PaymentInitiationDto } from './dto/payment-initiation.dto';
import { Event } from '../events/schemas/event.schema';
import { Ticket } from '../tickets/schemas/tickets.schema';
import { Transaction } from './schemas/transactions.schema';
import { Wallet } from './schemas/wallets.schema';
import paystackConfig from './config/paystact.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
    @Inject(paystackConfig.KEY)
    private readonly paystackConfiguration: ConfigType<typeof paystackConfig>,
  ) {}

  async initiatePayment(
    paymentInitiationDto: PaymentInitiationDto,
    user: ActiveUserData,
  ) {
    try {
      const event = await this.eventModel.findById(
        paymentInitiationDto.eventId,
      );
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      // creating wallet if it doesn't exist
      let wallet = await this.walletModel.findOne({
        user_id: event.creator_id,
      });

      if (!wallet) {
        wallet = await this.walletModel.create({
          balance: 0,
          user_id: event.creator_id,
        });
      }

      const transaction = await this.transactionModel.create({
        amount: event.price,
        status: 'pending',
        type: 'credit',
        wallet_id: wallet._id,
        event_id: event._id,
        initiator_id: user.sub,
      });

      const data = {
        amount: event.price * 100,
        email: user.email,
        reference: transaction._id,
      };

      const headers = {
        Authorization: `Bearer ${this.paystackConfiguration.key}`,
      };

      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        data,
        {
          headers,
        },
      );

      return response.data;
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  async paystackCallback(paystackCallBackBody) {
    const body = paystackCallBackBody;

    const transaction = await this.transactionModel.findOne({
      _id: body.data.reference,
      status: 'pending',
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // success
    if (body.event === 'charge.success') {
      const wallet = await this.walletModel.findOne({
        _id: transaction.wallet_id,
      });

      // Paystack fees
      const paystackFees = body.data.fees / 100;
      // Deductible amount for administration charges
      const deductibleAmount = transaction.amount - paystackFees;
      // TODO: Review the admin charges later
      // const adminCharges = (2 / 100) * deductibleAmount;
      // const walletBalance = deductibleAmount - adminCharges;
      const walletBalance = deductibleAmount;
      wallet.balance = wallet.balance + walletBalance;
      wallet.save();

      transaction.status = 'success';
      transaction.save();

      // Create a ticket
      await this.ticketModel.create({
        user_id: transaction.initiator_id,
        event_id: transaction.event_id,
        creator_id: wallet.user_id,
      });
    }

    // failed
    if (body.event === 'charge.failed') {
      transaction.status = 'failed';
      transaction.save();
    }

    return {
      message: 'Callback received',
    };
  }

  paystackSuccess() {
    return {
      message: 'Payment successful',
    };
  }
}
