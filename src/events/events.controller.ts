import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Event } from '../common/models/Event';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller({
  path: 'events',
  version: '1',
})
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The event has been successfully created.',
    type: Event,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.Creator)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      dest: './uploads',
    }),
  )
  create(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() image: Express.Multer.File,
    @ActiveUser() user: ActiveUserData,
  ) {
    const creatorId = user.sub;
    createEventDto.price = +createEventDto.price.toFixed(2);
    createEventDto.days_before = createEventDto.days_before || 1;
    const image_path = image.path;
    return this.eventsService.create(createEventDto, image_path, creatorId);
    // return 'will create an event';
  }

  @Public()
  @ApiResponse({
    status: 200,
    description: 'List of all events',
    type: Event,
    isArray: true,
  })
  @Get()
  findAll(@Query() paginationQuery?: PaginationQueryDto) {
    return this.eventsService.findAll(paginationQuery);
  }

  @Public()
  @ApiResponse({ status: 200, description: 'List of an event', type: Event })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // Get creator events
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'List of creator events',
    type: Event,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.Creator)
  @Get('/auth/creator')
  findCreatorEvents(
    @ActiveUser() user: ActiveUserData,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const creatorId = user.sub;
    return this.eventsService.findCreatorEvents(creatorId, paginationQuery);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.Creator)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.Creator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
