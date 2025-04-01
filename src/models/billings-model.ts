import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Objectives } from "./objectives-model";

@Entity("billings")
export class Billings {
  @PrimaryColumn()
  objectiveId: number;

  @PrimaryColumn()
  billingId: number;

  @PrimaryColumn({ type: "date" })
  date: Date;

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

  @ManyToOne(() => Objectives, (objectives) => objectives.id)
  @JoinColumn({ name: "objective_id" })
  objective: Objectives;
}
