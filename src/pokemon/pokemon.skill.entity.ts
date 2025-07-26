import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

export type PoketmonSkillTarget = 'SINGLE' | 'ALL';
export type PoketmonSkillType = 'PROJECTILE' | 'MELEE';

@Entity('poketmon_skill')
export class PoketmonSkill {
  @PrimaryColumn()
  pokemon_id: number;

  @PrimaryColumn()
  skill_id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  type: PoketmonSkillType;

  @Column({ type: 'varchar', length: 100 })
  target: PoketmonSkillTarget;

  @Column({ type: 'int' })
  damage: number;

  @Column({ type: 'int' })
  pp: number;
}