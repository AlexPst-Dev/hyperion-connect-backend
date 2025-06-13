import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";

import { Sessions } from "./sessions-model";

export enum EventCategory {
  HYPERION = "hyperion_event",
  HYPERLINK = "hyperlink_event",
  MEDICAL = "medical_event",
  COACHING = "coaching_event",
  SPORTING_ACTIVITY = "sporting_activity_event",
}

@Entity("events")
export class Events {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: EventCategory })
  eventCategory: EventCategory;

  @Column({ type: "text", nullable: true })
  title: string;

  @Column({ name: "responsible_ids", type: "varchar", nullable: true })
  responsibleIds: string;

  @Column({ name: "person_ongoing_ids", type: "varchar", nullable: true })
  personOngoingIds: string;

  @Column({ type: "text", nullable: true })
  location: string;

  @Column({ type: "date", nullable: true })
  date: Date;

  @Column({ type: "time", nullable: true })
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

@Entity(EventCategory.HYPERION)
export class HyperionEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Events, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "event_id" })
  event: Events;
}

@Entity(EventCategory.HYPERLINK)
export class HyperlinkEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Events, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "event_id" })
  event: Events;

  @Column({ nullable: true })
  theme: string;
}

@Entity(EventCategory.COACHING)
export class CoachingEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Events, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "event_id" })
  event: Events;

  @ManyToOne(() => Sessions, (session) => session.id)
  @JoinColumn({ name: "session_id" })
  session: Sessions;

  @Column({ name: "session_id", nullable: true })
  sessionId: number;

  @Column({ default: false })
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

@Entity(EventCategory.MEDICAL)
export class MedicalEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Events, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "event_id" })
  event: Events;
}

@Entity(EventCategory.SPORTING_ACTIVITY)
export class SportingActivityEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Events, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "event_id" })
  event: Events;

  @Column({ name: "max_participants", nullable: true })
  maxParticipants: number;
}
