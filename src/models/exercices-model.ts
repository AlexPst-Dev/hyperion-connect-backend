import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("exercises")
export class Exercises {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ name: "list_muscle_group_ids", type: "varchar", nullable: true })
  listMuscleGroupIds: string;

  @Column({ name: "duration_time" })
  durationTime: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  recommendations: string;

  @Column({ name: "publicImageUrl", nullable: true })
  publicImageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
