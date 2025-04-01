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

@Entity("subscriptions")
export class Subscriptions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "label_diagnostic" })
  labelDiagnostic: string;

  @Column({ name: "label_performance_plan" })
  labelPerformancePlan: string;

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
