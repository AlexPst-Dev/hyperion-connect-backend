import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Files } from "./files-model";

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

  @ManyToOne(() => Files, (file) => file.id)
  @JoinColumn({ name: "file_picture_id" })
  filePicture: Files;

  @Column({ name: "file_picture_id", nullable: true })
  filePictureId: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
