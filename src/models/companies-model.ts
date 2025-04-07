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
import { User } from "./users-model";
import { Files } from "./files-model";

@Entity("companies")
export class Companies {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "responsible_id" })
  responsible: User;

  @Column({ name: "responsible_id" })
  responsibleId: number;

  @Column()
  name: string;

  @OneToOne(() => Files, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "file_image_company_id" })
  fileImageCompany: Files;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "date_end_membership", type: "date", nullable: true })
  dateEndMembership: Date;

  @Column()
  city: string;

  @Column({ name: "pc" })
  postalCode: string;

  @Column()
  street: string;

  @Column({ name: "link_website", nullable: true })
  linkWebsite: string;

  @Column({ name: "link_fb", nullable: true })
  linkFacebook: string;

  @Column({ name: "link_insta", nullable: true })
  linkInstagram: string;

  @Column({ name: "link_linkedin", nullable: true })
  linkLinkedin: string;

  @Column({ name: "link_tiktok", nullable: true })
  linkTiktok: string;

  @Column({ name: "link_youtube", nullable: true })
  linkYoutube: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
