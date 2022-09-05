import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';

import EventEntity from '../event/event.entity';
import ChallengeEntity from './challenge.entity';
import UserEntity from '../user/user.entity';
import CoefficientEntity from '../coefficient/coefficient.entity';

import { ChallengePostDto } from './challenge.dto';
import { TYPE } from '../coefficient/coefficient.dto';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(ChallengeEntity)
    private readonly challengeRepository: Repository<ChallengeEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CoefficientEntity)
    private readonly coefRepository: Repository<CoefficientEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async createChallenge(data: ChallengePostDto, creator: UserEntity) {
    const users = await this.userRepository.find({
      where: {
        id: In(data.userIds),
      },
      relations: { avatar: false },
    });
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const event = {
        ...new EventEntity(),
        name: data.eventName,
        start: data.start,
        end: data.end,
        participants: [],
        winners: [],
      };
      const generatedEvent = await this.eventRepository.save(event);
      let coef = await this.coefRepository.findOne({
        where: { value: TYPE.STANDARD },
      });
      if (!coef) {
        coef = await this.coefRepository.save({
          ...new CoefficientEntity(),
          value: TYPE.STANDARD,
        });
      }

      // eslint-disable-next-line no-restricted-syntax
      for await (const user of users) {
        const challenge = {
          ...new ChallengeEntity(),
          eventId: generatedEvent.id,
          userId: user.id,
          creatorId: creator.id,
          coefficient: coef,
        };
        await queryRunner.manager.save(challenge);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
