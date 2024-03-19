import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ActiveUser } from '../iam/decorator/active-user.decorator';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { Roles } from '../iam/authorization/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Ticket, TicketQrCode } from '../common/models/Ticket';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Ticket created successfully',
    type: TicketQrCode,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post()
  create(
    @Body() createTicketDto: CreateTicketDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const user_id = user.sub;
    return this.ticketsService.create(createTicketDto, user_id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'List of completed tickets',
    type: Ticket,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('completed')
  findCompletedTickets(
    @Query() paginationQuery: PaginationQueryDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.ticketsService.findCompletedTickets(paginationQuery, user.sub);
  }

  // Get all user tickets
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'List of user tickets',
    type: Ticket,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('auth/user')
  findUserTickets(
    @ActiveUser() user: ActiveUserData,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const userId = user.sub;
    return this.ticketsService.findUserTickets(userId, paginationQuery);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Updated ticket' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.Creator)
  @Patch(':ticketId')
  update(
    @Param('ticketId') ticketId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.ticketsService.update(ticketId, user.sub);
  }

  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
