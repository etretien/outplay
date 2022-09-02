import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Relation,
} from 'typeorm';

import { TYPE } from './avatar.dto';

import UserEntity from '../user/user.entity';

@Entity('avatar')
class AvatarEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'simple-enum',
    enum: TYPE,
    default: TYPE.URL,
  })
  type: string;

  @Column()
  value: string;

  @OneToOne(() => UserEntity, (user) => user.avatar)
  @JoinColumn()
  user: Relation<UserEntity>;
}

export default AvatarEntity;
