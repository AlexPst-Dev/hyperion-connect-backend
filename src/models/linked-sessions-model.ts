import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Sessions } from "./sessions-model";
import { User } from "./users-model";

@Entity("linked_sessions")
export class LinkedSessions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: number;

  @ManyToOne(() => Sessions, (session) => session.id)
  @JoinColumn({ name: "session_id" })
  session: Sessions;

  @Column({ name: "session_id" })
  sessionId: number;
}
