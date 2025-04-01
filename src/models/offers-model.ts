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
import { Companies } from "./companies-model";

export enum OfferCategory {
  DISCOUNT = "discount",
  SPONSORSHIP = "sponsorship",
}

@Entity("offers")
@TableInheritance({ column: { type: "varchar", name: "offer_category" } })
export class Offers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Companies, (companies) => companies.id)
  @JoinColumn({ name: "company_id" })
  company: Companies;

  @Column({ name: "company_id" })
  companyId: number;

  @Column({ type: "varchar", name: "offer_category" })
  offerCategory: OfferCategory;

  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "text", nullable: true })
  conditions: string;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date" })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

@ChildEntity(OfferCategory.DISCOUNT)
export class DiscountOffer extends Offers {
  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  link: string;
}

@ChildEntity(OfferCategory.SPONSORSHIP)
export class SponsorshipOffer extends Offers {
  @Column({ name: "nb_person_max", type: "int" })
  nbPersonMax: number;

  @Column({ name: "person_ongoing_ids", type: "varchar", nullable: true })
  personOngoingIds: string;
}
