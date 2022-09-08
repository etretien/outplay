import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  Relation,
  ManyToMany,
  ManyToOne,
  OneToOne,
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

  @ManyToOne(() => EventEntity)
  @JoinColumn()
  event: Relation<EventEntity>;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: Relation<UserEntity>;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  creator: Relation<UserEntity>;

  @ManyToOne(() => CoefficientEntity, (coef) => coef)
  @JoinColumn()
  coefficient: Relation<CoefficientEntity>;
}

export default ChallengeEntity;
