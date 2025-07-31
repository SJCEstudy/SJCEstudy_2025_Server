import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shop')
export class Shop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['POKETMON', 'ITEM'] })
  type: 'POKETMON' | 'ITEM';

  @Column()
  target_id: number;

  @Column()
  price: number;

  @Column({ default: -1 })
  stock: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}