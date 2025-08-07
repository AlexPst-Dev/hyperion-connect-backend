import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  OneToOne,
  JoinTable,
  ManyToMany,
} from "typeorm";

import { Categories } from "./categories-model";
import { Subscriptions } from "./subscription-model";
import { Graphs } from "./graphs-model";
import { Companies } from "./companies-model";
import { Files } from "./files-model";

export enum ProfileCategory {
  SPORTSMAN = "sportsman",
  COACH = "coach",
  MEDIC = "medic",
  FREE = "free",
  PARTNER = "partner",
  ADMIN = "admin",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "first_name" })
  firstName: string;

  @Column({ name: "last_name" })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  city: string;

  @Column({ name: "pc", nullable: true })
  postalCode: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @ManyToOne(() => Files, (file) => file.id)
  @JoinColumn({ name: "file_picture_id" })
  filePicture: Files;

  @Column({ name: "file_picture_id", nullable: true })
  filePictureId: number;

  @Column({ name: "birth_date", type: "date", nullable: true })
  birthDate: Date;

  @Column({ name: "link_strava", nullable: true })
  stravaLink: string;

  @Column({ name: "link_fb", nullable: true })
  facebookLink: string;

  @Column({ name: "link_insta", nullable: true })
  instagramLink: string;

  @Column({ name: "link_linkedin", nullable: true })
  linkedinLink: string;

  @Column({ name: "link_tiktok", nullable: true })
  tiktokLink: string;

  @Column({ name: "link_youtube", nullable: true })
  youtubeLink: string;

  @Column({ name: "is_active", nullable: false, default: true })
  isActive: boolean;

  @Column({ name: "is_in_hyperlink_network", nullable: false, default: false })
  isInHyperlinkNetwork: boolean;

  @Column({ type: "enum", enum: ProfileCategory })
  profileCategory: ProfileCategory;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

@Entity(ProfileCategory.SPORTSMAN)
export class Sportsman {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Categories, (category) => category.id)
  @JoinColumn({ name: "sport_category" })
  sportCategory: Categories;

  @Column({ name: "sport_category", nullable: true })
  sportCategoryId: number;

  @Column({ name: "dispo_days", type: "char", length: 7, nullable: true })
  availableDays: string;

  @Column({ name: "dispo_time", nullable: true })
  availableTime: string;

  @Column({ name: "list_medic_notes", nullable: true })
  listMedicNotes: string;

  @Column({ name: "list_medic_files", nullable: true })
  listMedicFiles: string;

  @Column({ name: "list_medics_ids", nullable: true })
  listMedicsIds: string;

  @Column({ name: "list_user_files", nullable: true })
  listUserFiles: string;

  @OneToOne(() => Graphs, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "graph_id" })
  graph: Graphs;

  @Column({ name: "graph_id", nullable: true })
  graphId: number;

  @ManyToOne(() => Subscriptions, (subscription) => subscription.id)
  @JoinColumn({ name: "subscription_id" })
  subscription: Subscriptions;

  @Column({ name: "subscription_id", nullable: true })
  subscriptionId: number;

  @Column({ name: "trackingFile_url", nullable: true })
  trackingFileUrl: string;
}

@Entity(ProfileCategory.COACH)
export class Coach {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToMany(() => Categories)
  @JoinTable({
    name: "coach_categories",
    joinColumn: { name: "coach_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "category_id", referencedColumnName: "id" },
  })
  sportCategories: Categories[];

  @Column({ name: "can_import_sessions", default: false })
  canImportSessions: boolean;
}

@Entity(ProfileCategory.MEDIC)
export class Medic {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToMany(() => Categories)
  @JoinTable({
    name: "medic_categories",
    joinColumn: { name: "medic_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "category_id", referencedColumnName: "id" },
  })
  sportCategories: Categories[];

  @Column({ name: "can_import_sessions", default: false })
  canImportSessions: boolean;
}

@Entity(ProfileCategory.FREE)
export class Free {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}

@Entity(ProfileCategory.PARTNER)
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToOne(() => Companies, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company: Companies;

  @Column({ name: "company_id", nullable: true })
  companyId: number;
}

@Entity(ProfileCategory.ADMIN)
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}
