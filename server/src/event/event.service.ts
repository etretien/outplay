import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import EventEntity from './event.entity';
import ChallengeEntity from '../challenge/challenge.entity';
import UserEntity from '../user/user.entity';
import AvatarEntity from '../avatar/avatar.entity';
import ResultEntity from '../result/result.entity';

import { EventPatchDto, STATUS } from './event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    @InjectRepository(ChallengeEntity)
    private readonly challengeRepository: Repository<ChallengeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ResultEntity)
    private readonly resultRepository: Repository<ResultEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  private async setEventResult(
    event: EventEntity,
    users: UserEntity[],
    resultByUser: { id: number; point: number }[],
  ) {
    event.status = STATUS.FINISHED;
    event.winners = users.reduce<UserEntity[]>((result, user) => {
      const point = resultByUser.find((item) => item.id === user.id)!.point;
      if (point === 2) return [...result, user];
      return result;
    }, []);
    await this.eventRepository.save(event);
  }

  private async createResult(event: EventEntity, data: EventPatchDto) {
    const newResult = new ResultEntity();
    newResult.event = event;
    newResult.info = data;
    await this.resultRepository.save(newResult);
  }

  async getEvents(query: Record<string, string>) {
    if (query && query.userId) {
      const ownEvents = await this.eventRepository
        .createQueryBuilder('event')
        .where('event.creatorId = :id', { id: +query.userId })
        .leftJoin('event.winners', 'winner')
        .leftJoinAndSelect('event.winners', 'eventWinner')
        .leftJoin('event.participants', 'user')
        .leftJoinAndSelect('event.participants', 'userSelect')
        .leftJoinAndMapOne(
          'userSelect.challenge',
          ChallengeEntity,
          'challenge',
          'userSelect.id = challenge.userId',
        )
        .leftJoinAndMapOne(
          'userSelect.avatar',
          AvatarEntity,
          'avatar',
          'userSelect.avatarId = avatar.id',
        )
        .skip(0)
        .take(10)
        .orderBy('event.timestamp', 'DESC')
        .getMany();
      const participant = await this.eventRepository
        .createQueryBuilder('event')
        .leftJoinAndMapOne(
          'event.creator',
          UserEntity,
          'creator',
          'creator.id = event.creatorId',
        )
        .leftJoin('event.winners', 'winner')
        .leftJoinAndSelect('event.winners', 'eventWinner')
        .leftJoin('event.participants', 'user')
        .leftJoinAndSelect('event.participants', 'userSelect')
        .where('user.id = :id', { id: +query.userId })
        .leftJoinAndMapOne(
          'userSelect.challenge',
          ChallengeEntity,
          'challenge',
          'userSelect.id = challenge.userId',
        )
        .skip(0)
        .take(10)
        .orderBy('event.timestamp', 'DESC')
        .getMany();
      return { ownEvents, participant };
    }
    return undefined;
  }

  async setChallengeResult(id: number, data: EventPatchDto) {
    const resultByUsers = [];
    let team1Result = 0;
    let team2Result = 0;
    data.sets.forEach((set) => {
      if (set.team1 > set.team2) team1Result += 1;
      if (set.team1 < set.team2) team2Result += 1;
    });
    data.team1.forEach((member) => {
      let point = 0;
      if (team1Result > team2Result) point = 2;
      if (team1Result === team2Result) point = 1;
      resultByUsers.push({ id: member, point });
    });
    data.team2.forEach((member) => {
      let point = 0;
      if (team2Result > team1Result) point = 2;
      if (team2Result === team1Result) point = 1;
      resultByUsers.push({ id: member, point });
    });

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    let success = true;
    try {
      const event = await this.eventRepository.findOneBy({ id });
      const users = await this.userRepository.find({
        where: {
          id: In(resultByUsers.map((item) => item.id)),
        },
      });
      const challenges = await this.challengeRepository.find({
        where: {
          event: { id: event.id },
        },
        relations: {
          user: true,
        },
      });

      await this.setEventResult(event, users, resultByUsers);
      await this.createResult(event, data);

      // eslint-disable-next-line no-restricted-syntax
      for await (const user of users) {
        const point = resultByUsers.find((item) => item.id === user.id)!.point;
        user.rating = user.rating + point;
        await queryRunner.manager.save(user);
      }

      // eslint-disable-next-line no-restricted-syntax
      for await (const challenge of challenges) {
        const point = resultByUsers.find(
          (item) => item.id === challenge.user.id,
        )!.point;
        challenge.result = point;
        await queryRunner.manager.save(challenge);
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

  async setPaid(id: number, isPaid: boolean) {
    const event = await this.eventRepository.findOneBy({ id });
    if (!event)
      throw new HttpException('Event was not found', HttpStatus.BAD_REQUEST);

    event.isPaid = isPaid;
    return this.eventRepository.save(event);
  }
}
