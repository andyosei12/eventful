import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ActiveUser } from 'src/iam/decorator/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @Body() createTicketDto: CreateTicketDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const user_id = user.sub;
    return this.ticketsService.create(createTicketDto, user_id);
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    const user_id = user.sub;
    return this.ticketsService.update(id, user_id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
