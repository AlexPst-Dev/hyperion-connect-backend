import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum CategoryType {
  SPORT = "sport",
  MEDICAL = "medical",
  MUSCLE_GROUP = "muscle_group",
}

@Entity("categories")
export class Categories {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ name: "background_color" })
  backgroundColor: string;

  @Column({ name: "text_color" })
  textColor: string;

  @Column({ type: "enum", enum: CategoryType, name: "category_type" })
  categoryType: CategoryType;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
