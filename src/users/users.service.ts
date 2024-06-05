import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTellerDto } from './dto/create-teller.dto';
import { Teller } from './schemas/tellers.schema';

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

  findOne(email: string) {
    return this.userModel.findOne({
      email,
    });
  }
}
