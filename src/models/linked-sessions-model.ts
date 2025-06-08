import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Sessions } from "./sessions-model";
import { Sportsman } from "./users-model";

@Entity("linked_sessions")
export class LinkedSessions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sportsman, (sportsman) => sportsman.id)
  @JoinColumn({ name: "sportsman_id" })
  sportsman: Sportsman;

  @Column({ name: "sportsman_id" })
  sportsmanId: number;

  @ManyToOne(() => Sessions, (session) => session.id)
  @JoinColumn({ name: "session_id" })
  session: Sessions;

  @Column({ name: "session_id" })
  sessionId: number;
}
