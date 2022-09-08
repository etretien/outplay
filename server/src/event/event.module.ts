import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventController } from './event.controller';

import { EventService } from './event.service';

import EventEntity from '../event/event.entity';
import ChallengeEntity from '../challenge/challenge.entity';
import UserEntity from '../user/user.entity';
import ResultEntity from '../result/result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      ChallengeEntity,
      UserEntity,
      ResultEntity,
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
