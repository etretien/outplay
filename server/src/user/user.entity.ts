import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Relation,
} from 'typeorm';

import { STATUS } from './user.dto';

import AvatarEntity from '../avatar/avatar.entity';

@Entity('user')
class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    select: false,
  })
  registrationTime: string;

  @Column({ select: false })
  visitorId: string;

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
    length: 300,
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

  @OneToOne(() => AvatarEntity, (avatar) => avatar.user)
  @JoinColumn()
  avatar: Relation<AvatarEntity>;
}

export default UserEntity;
