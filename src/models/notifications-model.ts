import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum NotificationCategory {
  HOME_POPUP = "HOME_POPUP",
  NEWS = "NEWS",
}

@Entity("notifications")
export class Notifications {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: NotificationCategory,
    name: "notification_category",
  })
  notificationCategory: NotificationCategory;

  @Column()
  title: string;

  @Column({ type: "text" })
  text: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
