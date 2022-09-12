import {
  Controller,
  Get,
  Query,
  UseGuards,
  Patch,
  Param,
  Body,
} from '@nestjs/common';

import { AccessTokenGuard } from '../core/guards/access-token.guard';

import { EventService } from './event.service';

import { EventPaidDto, EventPatchDto } from './event.dto';

@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @UseGuards(AccessTokenGuard)
  @Get()
  async getChallenges(@Query() query: Record<string, string>) {
    return this.eventService.getEvents(query);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  async setChallengeResult(
    @Param('id') id: number,
    @Body() data: EventPatchDto | EventPaidDto,
  ) {
    if ((data as EventPatchDto).sets) {
      return this.eventService.setChallengeResult(id, data as EventPatchDto);
    }
    return this.eventService.setPaid(id, (data as EventPaidDto).isPaid);
  }
}
