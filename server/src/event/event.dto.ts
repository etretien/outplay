import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { TYPE } from '../avatar/avatar.dto';

export enum STATUS {
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
}

export class EventPatchDto {
  @IsNotEmpty()
  @IsArray({ message: 'team1 must be an array' })
  @IsNumber({}, { each: true, message: 'Not a valid value for team member id' })
  team1: number[];

  @IsNotEmpty()
  @IsArray({ message: 'team2 must be an array' })
  @IsNumber({}, { each: true, message: 'Not a valid value for team member id' })
  team2: number[];

  @IsNotEmpty()
  sets: { team1: number; team2: number }[];
}

export class EventPaidDto {
  @IsNotEmpty()
  @IsBoolean({ message: 'isPaid must be boolean' })
  isPaid: boolean;
}
