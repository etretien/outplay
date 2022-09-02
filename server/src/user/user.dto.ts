import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  Min,
  Max,
  IsNumber,
  IsArray,
  IsOptional,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

import { TYPE } from '../avatar/avatar.dto';

export enum STATUS {
  ACTIVE = 'ACTIVE',
  NOT_ACTIVE = 'NOT_ACTIVE',
  DELETED = 'DELETED',
}

export class UserPatchDto {
  @IsOptional()
  @IsString()
  public avatar: string;

  @IsOptional()
  @IsEnum(TYPE, { message: 'Not a valid avatar type' })
  public avatarType: TYPE;
}
