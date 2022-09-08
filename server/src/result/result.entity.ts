import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Relation,
} from 'typeorm';

import EventEntity from '../event/event.entity';
import { EventPatchDto } from '../event/event.dto';

@Entity('result')
class ResultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  info: EventPatchDto;

  @OneToOne(() => EventEntity)
  @JoinColumn()
  event: Relation<EventEntity>;
}

export default ResultEntity;
