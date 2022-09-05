import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Relation,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import UserEntity from '../user/user.entity';

export enum STATUS {
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
}

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
  })
  startDate: string;

  @Column({
    type: 'timestamp',
  })
  endDate: string;

  @Column({
    type: 'simple-enum',
    enum: STATUS,
    default: STATUS.PENDING,
  })
  status: STATUS;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  participants: Relation<UserEntity[]>;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  winners: Relation<UserEntity[]>;

  @OneToOne(() => UserEntity, (user) => user.id)
  @JoinColumn()
  creator: Relation<UserEntity>;
}

export default EventEntity;
