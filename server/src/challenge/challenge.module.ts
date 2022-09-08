import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { ChallengeController } from './challenge.controller';

import { ChallengeService } from './challenge.service';
import { UserService } from '../user/user.service';
import { EventService } from '../event/event.service';
import { EncryptionService } from '../core/encryption/encryption';
import { MailingService } from '../core/mailing/mailing';

import UserEntity from '../user/user.entity';
import EventEntity from '../event/event.entity';
import ChallengeEntity from './challenge.entity';
import CoefficientEntity from '../coefficient/coefficient.entity';
import AvatarEntity from '../avatar/avatar.entity';
import ResultEntity from '../result/result.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      ChallengeEntity,
      UserEntity,
      EventEntity,
      CoefficientEntity,
      AvatarEntity,
      ResultEntity,
    ]),
  ],
  controllers: [ChallengeController],
  providers: [
    ChallengeService,
    UserService,
    EventService,
    EncryptionService,
    MailingService,
  ],
})
export class ChallengeModule {}
