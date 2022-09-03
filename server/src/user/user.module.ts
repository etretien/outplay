import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EncryptionService } from '../core/encryption/encryption';
import { MailingService } from '../core/mailing/mailing';

import UserEntity from './user.entity';
import AvatarEntity from '../avatar/avatar.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserEntity, AvatarEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, EncryptionService, MailingService],
})
export class UserModule {}
