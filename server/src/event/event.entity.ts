import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Relation,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import UserEntity from '../user/user.entity';

import { STATUS } from './event.dto';

@Entity('event')
class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: string;

  @Column({
    length: 100,
  })
  name: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  startDate: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  endDate: string;

  @Column({
    type: 'simple-enum',
    enum: STATUS,
    default: STATUS.PENDING,
  })
  status: STATUS;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  participants: Relation<UserEntity[]>;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  winners: Relation<UserEntity[]>;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  creator: Relation<UserEntity>;
}

export default EventEntity;
