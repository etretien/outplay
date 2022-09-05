import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  Relation,
  ManyToMany,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import { RESULT, STATUS } from './challenge.dto';

import UserEntity from '../user/user.entity';
import CoefficientEntity from '../coefficient/coefficient.entity';
import EventEntity from '../event/event.entity';

@Entity('challenge')
class ChallengeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'simple-enum',
    enum: STATUS,
    default: STATUS.PENDING,
  })
  status: string;

  @Column({
    type: 'simple-enum',
    enum: RESULT,
    nullable: true,
  })
  result: number;

  @ManyToOne(() => EventEntity, (event) => event)
  @JoinColumn()
  event: Relation<EventEntity>;

  @ManyToMany(() => UserEntity, (user) => user)
  @JoinColumn()
  user: Relation<UserEntity>;

  @ManyToMany(() => UserEntity, (user) => user)
  @JoinColumn()
  creator: Relation<UserEntity>;

  @OneToMany(() => CoefficientEntity, (coef) => coef.value)
  @JoinColumn()
  coefficient: Relation<CoefficientEntity>;
}

export default ChallengeEntity;
