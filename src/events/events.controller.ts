import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Roles } from 'src/iam/authorization/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { ActiveUser } from 'src/iam/decorator/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { Public } from 'src/iam/auth/decorators/skip-auth.decorator';

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
    return this.eventsService.create(createEventDto, creatorId);
  }

  @Public()
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // Get creator events
  @Roles(Role.Creator)
  @Get('/auth/creator')
  findCreatorEvents(@ActiveUser() user: ActiveUserData) {
    const creatorId = user.sub;
    return this.eventsService.findCreatorEvents(creatorId);
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
