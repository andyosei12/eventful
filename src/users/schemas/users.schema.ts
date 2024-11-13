import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ unique: true })
  phone_number: string;

  @Prop()
  password: string;

  @Prop({ enum: Role, default: Role.Regular })
  role: Role;

  @Prop({ default: Date.now() })
  created_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
