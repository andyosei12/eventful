import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EventSchema = HydratedDocument<Event>;

@Schema()
export class Event {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  date: Date;

  @Prop()
  time: string;

  @Prop()
  image_public_id: string;

  @Prop()
  image_secure_url: string;

  @Prop()
  price: number;

  @Prop()
  location: string;

  @Prop()
  days_before: string;

  @Prop()
  reminder_date: Date;

  @Prop()
  creator_id: Types.ObjectId;

  @Prop({ default: Date.now() })
  created_at: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
