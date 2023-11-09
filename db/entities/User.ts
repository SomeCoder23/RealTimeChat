import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Profile } from "./Profile.js";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 50, nullable: false })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ length: 50, nullable: false })
  email: string;

  @Column({
    type: "date",
  })
  createdAt: Date;

  @OneToOne(() => Profile, { eager: true })
  @JoinColumn()
  profile: Profile;

  @Column({ nullable: true })
  verificationToken: string;
}
