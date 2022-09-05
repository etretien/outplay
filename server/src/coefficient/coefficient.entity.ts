import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import { TYPE } from './coefficient.dto';

@Entity('avatar')
class CoefficientEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'simple-enum',
    enum: TYPE,
    default: TYPE.STANDARD,
  })
  value: number;
}

export default CoefficientEntity;
