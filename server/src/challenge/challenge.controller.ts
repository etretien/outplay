import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ChallengeService } from './challenge.service';
import { EventService } from '../event/event.service';
import { UserService } from '../user/user.service';

import { AccessTokenGuard } from '../core/guards/access-token.guard';

import { ChallengePostDto } from './challenge.dto';

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
}
