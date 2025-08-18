import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum FileCategory {
  IMAGE = "IMAGE",
  MEDICAL_FILE = "MEDICAL_FILE",
  USER_FILE = "USER_FILE",
  SESSION_IMPORTED = "SESSION_IMPORTED",
  SUBSCRIPTION = "SUBSCRIPTION",
}

@Entity("files")
export class Files {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ name: "mime_type", length: 100, nullable: true })
  mimeType: string;

  @Column({
    type: "longblob",
    name: "data",
    nullable: true,
  })
  data: Buffer;

  @Column({ nullable: true })
  physicalName: string;

  @Column({ nullable: true })
  url: string;

  @Column({ type: "enum", enum: FileCategory, name: "file_category" })
  fileCategory: FileCategory;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
