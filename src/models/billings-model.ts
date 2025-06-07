import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
  Index,
} from "typeorm";
import { Objectives } from "./objectives-model";

@Entity("billings")
@Unique(["objectiveId", "date"])
@Index("IDX_OBJECTIVE_ID", ["objectiveId"])
export class Billings {
  @PrimaryGeneratedColumn({ name: "billing_id" })
  billingId: number;

  @ManyToOne(() => Objectives, (objectives) => objectives.id)
  @JoinColumn({ name: "objective_id" })
  objective: Objectives;

  @Column({ name: "objective_id" })
  objectiveId: number;

  @Column({ type: "date" })
  date: Date;

  @Column({ name: "global_amount", type: "decimal", precision: 10, scale: 2 })
  globalAmount: number;

  @Column({ name: "is_monthly", default: false })
  isMonthly: boolean;

  @Column({
    name: "monthly_amount",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  monthlyAmount: number;

  @Column({ name: "payment_received", default: false })
  paymentReceived: boolean;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
