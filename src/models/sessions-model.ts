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
import { User } from "./users-model";

@Entity("sessions")
export class Sessions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ name: "nb_exercises" })
  numberOfExercises: number;

  @Column({ name: "duration_time" })
  durationTime: string;

  @ManyToOne(() => Files, (file) => file.id)
  @JoinColumn({ name: "file_picture_id" })
  filePicture: Files;

  @Column({ name: "file_picture_id", nullable: true })
  filePictureId: number;

  @Column({ name: "list_exercises", type: "varchar", nullable: true })
  listExercises: string;

  @Column({ nullable: true })
  recommendations: string;

  @Column({ nullable: true })
  contributions: string;

  @Column({ default: false })
  done: boolean;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "author_id" })
  author: User;

  @Column({ name: "author_id", nullable: true })
  authorId: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
