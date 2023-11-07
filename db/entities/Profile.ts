import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

  @Column({ length: 255, nullable: true, default: "Welcome to my profile :)" })
  bio: string;

  @Column({
    nullable: false, 
    type: 'enum', 
    enum: ['online', 'offline'], 
    default: 'offline'
  })
  status: "online" | "offline";

}