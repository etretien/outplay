import {
  IsString,
  MaxLength,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsEmail,
} from 'class-validator';

import { TYPE } from '../avatar/avatar.dto';

export enum STATUS {
  ACTIVE = 'ACTIVE',
  NOT_ACTIVE = 'NOT_ACTIVE',
  DELETED = 'DELETED',
}

export class UserPatchAvatarDto {
  @IsOptional()
  @IsString()
  public avatar: string;

  @IsOptional()
  @IsEnum(TYPE, { message: 'Not a valid avatar type' })
  public avatarType: TYPE;
}

export class UserPatchDto {
  @IsOptional()
  @MaxLength(20, {
    message: 'About is too long',
  })
  about: string;

  @IsOptional()
  @MaxLength(20, {
    message: 'Game level is too long',
  })
  gameLevel: string;
}

export class UserPostDto {
  @IsNotEmpty()
  @IsString({ message: 'First name must be string' })
  firstName: string;

  @IsNotEmpty()
  @IsString({ message: 'Last name must be string' })
  lastName: string;

  @IsNotEmpty()
  @IsString({ message: 'Email must be string' })
  @IsEmail({ message: 'Not a valid email' })
  email: string;

  @IsNotEmpty()
  @IsString({ message: 'Password must be string' })
  password: string;

  @IsNotEmpty()
  @IsString({ message: 'Country code must be string' })
  countryCode: string;

  visitorId: string;
}
