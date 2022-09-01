import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('avatar')
class AvatarEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    value: string;
}

export default AvatarEntity;
