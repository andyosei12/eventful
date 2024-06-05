import { IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTellerDto {
  @IsString()
  user_id: Types.ObjectId;

  @IsString()
  creator_id: Types.ObjectId;
}
