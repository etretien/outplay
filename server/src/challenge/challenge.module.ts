import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChallengeController } from './challenge.controller';

import { ChallengeService } from './challenge.service';
import { UserService } from '../user/user.service';
import { EventService } from '../event/event.service';

import UserEntity from '../user/user.entity';
import EventEntity from '../event/event.entity';
import ChallengeEntity from './challenge.entity';
import CoefficientEntity from '../coefficient/coefficient.entity';
import AvatarEntity from '../avatar/avatar.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChallengeEntity,
      UserEntity,
      EventEntity,
      CoefficientEntity,
      AvatarEntity,
    ]),
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService, UserService, EventService],
})
export class ChallengeModule {}
