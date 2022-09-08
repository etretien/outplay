import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import EventEntity from '../event/event.entity';
import ChallengeEntity from './challenge.entity';
import UserEntity from '../user/user.entity';
import CoefficientEntity from '../coefficient/coefficient.entity';

import { ChallengePostDto, STATUS } from './challenge.dto';
import { TYPE } from '../coefficient/coefficient.dto';
import { STATUS as EVENT_STATUS } from '../event/event.dto';

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
    let success = true;
    try {
      const event = new EventEntity();
      event.creator = creator;
      event.name = data.eventName;
      event.participants = users;
      event.winners = [];

      const generatedEvent = await this.eventRepository.save(event);
      let coef = await this.coefRepository.findOne({
        where: { value: TYPE.STANDARD },
      });
      if (!coef) {
        const newCoef = new CoefficientEntity();
        newCoef.value = TYPE.STANDARD;
        coef = await this.coefRepository.save(newCoef);
      }

      // eslint-disable-next-line no-restricted-syntax
      for await (const user of users) {
        const newChallenge = new ChallengeEntity();
        newChallenge.event = generatedEvent;
        newChallenge.creator = creator;
        newChallenge.user = user;
        newChallenge.coefficient = coef;
        await queryRunner.manager.save(newChallenge);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      success = false;
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return { success };
  }

  async getChallenges(query: Record<string, string>) {
    const where =
      query && query.userId
        ? {
            status: STATUS.PENDING,
            user: { id: +query.userId },
          }
        : {
            status: STATUS.PENDING,
          };
    return this.challengeRepository.find({
      where,
      relations: {
        event: true,
        creator: true,
      },
    });
  }

  async updateChallenge(id: number, status: STATUS) {
    const challengeToUpdate = await this.challengeRepository.findOne({
      where: { id },
      relations: {
        event: true,
      },
    });
    if (!challengeToUpdate) return undefined;

    challengeToUpdate.status = status;
    const updated = await this.challengeRepository.save(challengeToUpdate);
    const challenges = await this.challengeRepository.find({
      where: {
        event: { id: challengeToUpdate.event.id },
      },
    });
    const allDeclined = challenges.every(
      (item) => item.status === STATUS.DECLINED,
    );
    if (allDeclined) {
      const event = await this.eventRepository.findOneBy({
        id: challengeToUpdate.event.id,
      });
      event.status = EVENT_STATUS.FAILED;
      await this.eventRepository.save(event);
    }
    return updated;
  }
}
