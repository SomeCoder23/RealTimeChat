import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ length: 255, nullable: false })
  content: string;

  @Column({
    nullable: false, 
    type: 'enum', 
    enum: ['Text', 'Attachment'], 
    default: 'Text'
  })
  type: "Text" | "Attachment";

  @CreateDateColumn({
    type: 'timestamp',
    default: () => "CURRENT_TIMESTAMP()"
  })
  timeSent: Date;


//   @Column()
//   sender: User;

//   @Column()
//   reciever: User;

  @Column({nullable: false})
  chatID: number;


}