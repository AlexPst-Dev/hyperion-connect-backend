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
  @PrimaryGeneratedColumn()
  billingId: number;

  @ManyToOne(() => Objectives, (objectives) => objectives.id)
  @JoinColumn({ name: "objective_id" })
  objective: Objectives;

  @Column({ name: "objective_id" })
  objectiveId: number;

  @Column({ type: "date" })
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
}
