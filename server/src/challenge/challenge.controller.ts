import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Query,
  Patch,
  Param,
} from '@nestjs/common';

import { ChallengeService } from './challenge.service';
import { EventService } from '../event/event.service';
import { UserService } from '../user/user.service';

import { AccessTokenGuard } from '../core/guards/access-token.guard';

import { ChallengePostDto, STATUS } from './challenge.dto';

@Controller('challenges')
export class ChallengeController {
  constructor(
    private challengeService: ChallengeService,
    private eventService: EventService,
    private userService: UserService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async createChallenge(@Body() data: ChallengePostDto) {
    const creator = await this.userService.getUserById(data.creatorId);
    if (!creator)
      throw new HttpException('Creator not found', HttpStatus.BAD_REQUEST);

    return this.challengeService.createChallenge(data, creator);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async getChallenges(@Query() query: Record<string, string>) {
    return this.challengeService.getChallenges(query);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  async updateChallenge(
    @Param('id') id: number,
    @Body() data: { status: STATUS },
  ) {
    return this.challengeService.updateChallenge(id, data.status);
  }
}
