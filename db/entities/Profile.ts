import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 255, nullable: false })
  fullName: string;

  @Column({
    type: 'date',
    nullable: true
  })
  birthday: Date;

  @Column({ length: 255, nullable: false })
  bio: string;

  @Column({
    nullable: false, 
    type: 'enum', 
    enum: ['online', 'offline'], 
    default: 'offline'
  })
  status: "online" | "offline";

}