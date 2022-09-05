import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsString,
  IsDate,
} from 'class-validator';
import { Timestamp } from 'typeorm';

export enum STATUS {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
}

export enum RESULT {
  WIN = 2,
  LOSE = 0,
  DRAW = 1,
}

export class ChallengePostDto {
  @IsNotEmpty()
  @IsNumber(null, { message: 'User id must be number' })
  userId: number;

  @IsNotEmpty()
  @IsNumber(null, { message: 'Event id must be number' })
  eventId: number;

  @IsNotEmpty()
  @IsNumber(null, { message: 'Creator id must be number' })
  creatorId: number;

  @IsNotEmpty()
  @IsArray({ message: 'User ids must be an array' })
  @IsNumber({}, { each: true, message: 'Not a valid value for user id' })
  userIds: number[];

  @IsNotEmpty()
  @IsString({ message: 'Event name must be string' })
  eventName: string;

  @IsNotEmpty()
  @IsDate({ message: 'Start must be date' })
  start: Date;

  @IsNotEmpty()
  @IsDate({ message: 'End must be date' })
  end: Date;
}
