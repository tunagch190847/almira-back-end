import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_detail')
export class UserDetail {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  user_id: string;

  @Column({ name: 'email', type: 'varchar', length: 255, default: null })
  email: string;

  @Column({
    name: 'gender',
    type: 'int',
    default: -1,
  })
  gender: number;

  @Column({ name: 'phone_number', type: 'varchar', length: 65, default: null })
  phone_number: string;

  @Column({ name: 'latitude', type: 'float', default: null })
  latitude: number;

  @Column({ name: 'longitude', type: 'float', default: null })
  longitude: number;

  @Column({ name: 'location', type: 'point', default: null, nullable: true })
  location: string;

  @Column({ name: 'birthdate', type: 'date', default: null })
  birthdate: Date;

  @Column({
    name: 'introduction',
    type: 'varchar',
    length: 1000,
    default: null,
  })
  introduction: string;

  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 512,
    default: null,
  })
  image_url: string;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 512,
    default: null,
  })
  thumbnail_url: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'current_timestamp',
  })
  created_at: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: null,
    onUpdate: 'current_timestamp',
  })
  updated_at: Date | null;

  @OneToOne(() => User, (user) => user.userDetail)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
