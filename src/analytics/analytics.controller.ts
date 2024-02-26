import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from 'src/iam/authorization/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { AnalyticsService } from './analytics.service';
import { ActiveUser } from 'src/iam/decorator/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles(Role.Creator)
  @Get('/tickets_sold')
  getTicketsSold(@ActiveUser() user: ActiveUserData) {
    const creator_id = user.sub;
    return this.analyticsService.getTicketsSold(creator_id);
  }

  @Roles(Role.Creator)
  @Get('/tickets/completed')
  getCompletedTickets(@ActiveUser() user: ActiveUserData) {
    const creator_id = user.sub;
    return this.analyticsService.getCompletedTickets(creator_id);
  }

  @Roles(Role.Creator)
  @Get(':eventId/tickets_sold')
  getTicketsSoldByEvent(
    @Param('eventId') eventId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    const creator_id = user.sub;
    return this.analyticsService.getTicketsSoldByEvent(eventId, creator_id);
  }

  @Roles(Role.Creator)
  @Get(':eventId/tickets/completed')
  getCompletedTicketsByEvent(
    @Param('eventId') eventId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    const creator_id = user.sub;
    return this.analyticsService.getCompletedTicketsByEvent(
      eventId,
      creator_id,
    );
  }

  @Roles(Role.Creator)
  @Get('revenue')
  getRevenue(@ActiveUser() user: ActiveUserData) {
    const creator_id = user.sub;
    return this.analyticsService.getRevenue(creator_id);
  }

  @Roles(Role.Creator)
  @Get('revenue/:eventId')
  getRevenueByEvent(
    @Param('eventId') eventId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    const creator_id = user.sub;
    return this.analyticsService.getRevenueByEvent(eventId, creator_id);
  }
}
