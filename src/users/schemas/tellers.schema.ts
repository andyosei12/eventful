import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TellerDocument = HydratedDocument<Teller>;

@Schema()
export class Teller {
  @Prop()
  user_id: Types.ObjectId;

  @Prop()
  creator_id: Types.ObjectId;

  @Prop({ default: Date.now() })
  created_at: Date;
}

export const TellerSchema = SchemaFactory.createForClass(Teller);
