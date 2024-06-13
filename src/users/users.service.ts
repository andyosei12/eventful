import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model, Types } from 'mongoose';
import { User } from './schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTellerDto } from './dto/create-teller.dto';
import { Teller } from './schemas/tellers.schema';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Teller.name) private tellerModel: Model<Teller>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async createTeller(createTellerDto: CreateTellerDto) {
    const createdTeller = new this.tellerModel(createTellerDto);
    return await createdTeller.save();
  }

  async findOneById(user_id: Types.ObjectId) {
    return this.userModel.findById(user_id);
  }

  findOne(email: string) {
    return this.userModel.findOne({
      email,
    });
  }

  async findTellers(user: ActiveUserData) {
    // make a join with the users collection
    return this.tellerModel.aggregate([
      {
        $match: {
          creator_id: user.sub,
        },
      },
      { $set: { user_id: { $toObjectId: '$user_id' } } },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          user: 1,
        },
      },
    ]);
  }

  async findOneAndUpdate(user_id: Types.ObjectId, userDto: UpdateUserDto) {
    return await this.userModel.findByIdAndUpdate(user_id, userDto);
  }

  async removeTeller(user_id: string) {
    await this.userModel.deleteOne({
      _id: user_id,
    });

    return this.tellerModel.deleteOne({
      user_id: new Types.ObjectId(user_id),
    });
  }
}
