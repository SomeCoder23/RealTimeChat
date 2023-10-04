import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ length: 100, nullable: true })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({
    nullable: false, 
    type: 'enum', 
    enum: ['1To1', 'group'], 
    default: '1To1'
  })
  type: "1To1" | "group";

  @CreateDateColumn({
    type: 'timestamp',
    default: () => "CURRENT_TIMESTAMP()"
  })
  createdAt: Date;


//   @Column()
//   participents: User[];

//   @Column()
//   reciever: User;

  @Column({nullable: false})
  chatID: number;


}