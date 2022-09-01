import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

import { STATUS } from './user.dto';

@Entity('user')
class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
  })
  firstName: string;

  @Column({
    length: 100,
  })
  lastName: string;

  @Column({
    length: 100,
    select: false,
    unique: true,
  })
  email: string;

  @Column({
    length: 100,
    select: false,
  })
  password: string;

  @Column({
    length: 100,
    nullable: true,
  })
  about: string;

  @Column({
    length: 100,
    nullable: true,
  })
  gameLevel: string;

  @Column({
    type: 'simple-enum',
    enum: STATUS,
    default: STATUS.NOT_ACTIVE,
  })
  status: STATUS;

  @Column({
    default: 0,
  })
  rating: number;

  @Column({
    default: 0,
  })
  balance: number;

  @Column({
    length: 100,
    nullable: true,
  })
  minimaId: string;

  @Column()
  countryCode: string;

  @Column({
    length: 100,
    select: false,
    nullable: true,
  })
  refreshToken: string;

  @Column({
    length: 300,
    unique: true,
    select: false,
  })
  activationLink: string;

  @PrimaryColumn({ type: 'int', default: 0 })
  teamId: number;

  @PrimaryColumn({ type: 'int', default: 0 })
  avatarId: number;
}

export default UserEntity;
