import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EncryptionService } from '../core/encryption/encryption';

import UserEntity from './user.entity';
import AvatarEntity from '../avatar/avatar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AvatarEntity])],
  controllers: [UserController],
  providers: [UserService, EncryptionService],
})
export class UserModule {}
