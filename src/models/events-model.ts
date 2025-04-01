import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  TableInheritance,
  ChildEntity,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { Sessions } from "./sessions-model";

export enum EventCategory {
  HYPERION = "hyperion",
  HYPERLINK = "hyperlink",
  MEDICAL = "medical",
  COACHING = "coaching",
  SPORTING_ACTIVITY = "sporting_activity",
}

@Entity("events")
@TableInheritance({ column: { type: "varchar", name: "event_category" } })
export class Events {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", name: "event_category" })
  eventCategory: EventCategory;

  @Column({ name: "responsible_ids", type: "varchar", nullable: true })
  responsibleIds: string;

  @Column({ name: "person_ongoing_ids", type: "varchar", nullable: true })
  personOngoingIds: string;

  @Column()
  location: string;

  @Column({ type: "date" })
  date: Date;

  @Column({ type: "time" })
  time: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

@ChildEntity(EventCategory.HYPERION)
export class HyperionEvent extends Events {}

@ChildEntity(EventCategory.HYPERLINK)
export class HyperlinkEvent extends Events {
  @Column({ nullable: true })
  theme: string;
}

@ChildEntity(EventCategory.COACHING)
export class CoachingEvent extends Events {
  @ManyToOne(() => Sessions, (session) => session.id)
  @JoinColumn({ name: "session_id" })
  session: Sessions;

  @Column({ name: "session_id", nullable: true })
  sessionId: number;

  @Column({ nullable: true })
  isDone: boolean;

  @Column({ nullable: true })
  sportsmanComment: string;

  @Column({ nullable: true })
  sportsmanNote: string;

  @Column({ nullable: true })
  coachComment: string;

  @Column({ nullable: true })
  coachNote: string;
}

@ChildEntity(EventCategory.MEDICAL)
export class MedicalEvent extends Events {}

@ChildEntity(EventCategory.SPORTING_ACTIVITY)
export class SportingActivityEvent extends Events {
  @Column({ nullable: true })
  maxParticipants: number;
}
