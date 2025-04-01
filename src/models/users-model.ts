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

import { Categories } from "./categories-model";

export enum ProfileCategory {
  SPORTSMAN = "sportsman",
  COACH = "coach",
  MEDIC = "medic",
  FREE = "free",
  PARTNER = "partner",
  ADMIN = "admin",
}

@Entity("users")
@TableInheritance({ column: { type: "varchar", name: "profile_category" } })
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

  @Column({ type: "varchar", name: "profile_category" })
  profileCategory: ProfileCategory;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

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

  @Column({ nullable: false, default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

@ChildEntity(ProfileCategory.SPORTSMAN)
export class Sportsman extends User {
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

  @Column({ name: "graph_id", nullable: true })
  graphId: number;

  @Column({ name: "subscription_id", nullable: true })
  subscriptionId: number;
}

@ChildEntity(ProfileCategory.COACH)
export class Coach extends User {
  @ManyToOne(() => Categories, (category) => category.id)
  @JoinColumn({ name: "sport_category" })
  sportCategory: Categories;

  @Column({ name: "sport_category", nullable: true })
  sportCategoryId: number;

  @Column({ name: "can_import_sessions", default: false })
  canImportSessions: boolean;
}

@ChildEntity(ProfileCategory.MEDIC)
export class Medic extends User {
  @ManyToOne(() => Categories, (category) => category.id)
  @JoinColumn({ name: "medic_category" })
  medicCategory: Categories;

  @Column({ name: "medic_category", nullable: true })
  medicCategoryId: number;

  @Column({ name: "can_import_sessions", default: false })
  canImportSessions: boolean;
}

@ChildEntity(ProfileCategory.FREE)
export class FreeUser extends User {}

@ChildEntity(ProfileCategory.PARTNER)
export class Partner extends User {
  @Column({ name: "company_id", nullable: true })
  companyId: number;
}

@ChildEntity(ProfileCategory.ADMIN)
export class Admin extends User {}
