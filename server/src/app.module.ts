import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import UserEntity from './user/user.entity';
import AvatarEntity from './avatar/avatar.entity';
import EventEntity from './event/event.entity';
import ChallengeEntity from './challenge/challenge.entity';
import CoefficientEntity from './coefficient/coefficient.entity';
import ResultEntity from './result/result.entity';

import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { ChallengeModule } from './challenge/challenge.module';

import { AuthModule } from './auth/auth.module';
import { Encryption } from './core/encryption/encryption';
import { Mailing } from './core/mailing/mailing';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: config.get<'aurora-postgres'>('TYPEORM_CONNECTION'),
        username: config.get<string>('TYPEORM_USERNAME'),
        password: config.get<string>('TYPEORM_PASSWORD'),
        database: config.get<string>('TYPEORM_DATABASE'),
        host:
          process.env.NODE_ENV === 'development'
            ? config.get<string>('TYPEORM_HOST_DEV')
            : config.get<string>('TYPEORM_HOST'),
        port: +config.get<number>('TYPEORM_PORT') || 1234,
        entities: [
          UserEntity,
          AvatarEntity,
          EventEntity,
          ChallengeEntity,
          CoefficientEntity,
          ResultEntity,
        ],
        synchronize: true,
      }),
    }),
    Encryption,
    Mailing,
    AuthModule,
    UserModule,
    EventModule,
    ChallengeModule,
  ],
})
export class AppModule {}
