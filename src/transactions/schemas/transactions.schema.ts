import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { nanoid } from 'nanoid';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  @Prop({ default: () => nanoid(10) })
  _id: string;

  @Prop()
  balance: number;

  @Prop()
  wallet_id: string;

  @Prop({ enum: ['debit', 'credit'] })
  type: string;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ enum: ['pending', 'completed', 'failed'], default: 'pending' })
  status: string;

  @Prop({ default: Date.now() })
  created_at: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
