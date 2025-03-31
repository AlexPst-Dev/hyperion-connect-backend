import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Objectives } from "./objectives-model";

@Entity("billings")
export class Billings {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Objectives, (objectives) => objectives.id)
  @JoinColumn({ name: "objective_id" })
  objective: Objectives;

  @Column({ name: "objective_id" })
  objectiveId: number;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date" })
  endDate: Date;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  globalAmount: number;

  @Column({ default: false })
  isMonthly: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  monthlyAmount: number;

  @Column({ default: false })
  paymentReceived: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
