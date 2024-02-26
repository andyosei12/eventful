import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Status } from '../enums/status.enum';

export type TicketSchema = HydratedDocument<Ticket>;

@Schema()
export class Ticket {
  @Prop()
  user_id: Types.ObjectId;

  @Prop()
  event_id: Types.ObjectId;

  @Prop({ enum: Status, default: Status.Pending })
  status: Status;

  @Prop()
  creator_id: Types.ObjectId;

  @Prop()
  reminder_date: Date;

  @Prop({ default: Date.now() })
  created_at: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
