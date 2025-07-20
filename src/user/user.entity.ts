import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    seq: number;

    @Column({ unique: true })
    id: string;

    @Column()
    password: string;

    @Column()
    created_at: number;
}