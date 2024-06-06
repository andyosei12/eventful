import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActiveUser } from 'src/iam/decorator/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('/tellers')
  findTellers(@ActiveUser() user: ActiveUserData) {
    return this.usersService.findTellers(user);
  }
}
