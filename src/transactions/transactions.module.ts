import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schemas/transactions.schema';
import { Wallet, WalletSchema } from './schemas/wallets.schema';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Event, EventSchema } from '../events/schemas/event.schema';
import { Ticket, TicketSchema } from '../tickets/schemas/tickets.schema';
import paystactConfig from './config/paystact.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Event.name, schema: EventSchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
    ConfigModule.forFeature(paystactConfig),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class TransactionsModule {}
