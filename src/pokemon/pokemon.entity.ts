import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('poketmon')
export class Poketmon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  hp: number;
}

@Entity()
export class UserPoketmon {
  @PrimaryGeneratedColumn()
  seq: number;

  @Column()
  user_seq: number;

  @Column()
  pokemon_id: number;

  @CreateDateColumn()
  created_at: Date;
}