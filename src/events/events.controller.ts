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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Roles } from '../iam/authorization/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { ActiveUser } from '../iam/decorator/active-user.decorator';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { Public } from '../iam/auth/decorators/skip-auth.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Roles(Role.Creator)
  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const creatorId = user.sub;
    createEventDto.price = +createEventDto.price.toFixed(2);
    createEventDto.days_before = createEventDto.days_before || 1;
    return this.eventsService.create(createEventDto, creatorId);
  }

  @Public()
  @Get()
  findAll(@Query() paginationQuery?: PaginationQueryDto) {
    return this.eventsService.findAll(paginationQuery);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // Get creator events
  @Roles(Role.Creator)
  @Get('/auth/creator')
  findCreatorEvents(
    @ActiveUser() user: ActiveUserData,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const creatorId = user.sub;
    return this.eventsService.findCreatorEvents(creatorId, paginationQuery);
  }

  @Roles(Role.Creator)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Roles(Role.Creator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
