import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Files } from "./files-model";

export enum MonthlyMonitoringEnum {
  COMPLETE = "COMPLETE",
  DIETETIC = "DIETETIC",
  MENTAL_COACHING = "MENTAL_COACHING",
}

@Entity("subscriptions")
export class Subscriptions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "is_bilan_complete", nullable: false, default: true })
  isBilanComplete: boolean;

  @Column({
    type: "enum",
    enum: MonthlyMonitoringEnum,
    name: "monthly_monitoring_category",
    nullable: true,
  })
  monthlyMonitoringCategory: MonthlyMonitoringEnum;

  @Column({ name: "start_date", type: "date", nullable: true })
  startDate: Date;

  @Column({ name: "end_date", type: "date", nullable: true })
  endDate: Date;

  @Column({ name: "other_servises", nullable: true })
  otherServises: string;

  @ManyToOne(() => Files, (file) => file.id)
  @JoinColumn({ name: "subscription_file_id" })
  subscriptionFile: Files;

  @Column({ name: "subscription_file_id" })
  subscriptionFileId: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
