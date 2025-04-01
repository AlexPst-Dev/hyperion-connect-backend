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

@Entity("graphs")
export class Graphs {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "responsible_id" })
  responsible: User;

  @Column({ name: "responsible_id" })
  responsibleId: number;

  @Column()
  title: string;

  @Column({ name: "measured_value", type: "varchar" })
  measuredValue: string;

  @Column({ name: "list_monthly_value", type: "varchar" })
  listMonthlyValue: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: "start_date", type: "date" })
  startDate: Date;

  @Column({ name: "end_date", type: "date" })
  endDate: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
