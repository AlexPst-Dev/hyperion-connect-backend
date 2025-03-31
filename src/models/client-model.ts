import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user-model';

@Entity('client')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'professional_id' })
  user: User;

  @Column({ name: 'professional_id' })
  professionalId: number;

  @Column({ name: 'list_of_client_ids', nullable: true })
  listOfClientIds: string;
}
