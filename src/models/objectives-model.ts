import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./users-model";

@Entity("objectives")
export class Objectives {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "sportsman_id" })
  sportsman: User;

  @Column({ name: "sportsman_id" })
  sportsmanId: number;

  @Column()
  label: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "responsible_id" })
  responsible: User;

  @Column({ name: "responsible_id" })
  responsibleId: number;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date" })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
