import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { nanoid } from 'nanoid';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema()
export class Wallet {
  @Prop({ default: () => nanoid() })
  _id: string;

  @Prop()
  balance: number;

  @Prop()
  user_id: Types.ObjectId;

  @Prop({ default: Date.now() })
  created_at: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
