import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { User } from "./User.js";
import { Message } from "./Message.js";

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

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
    type: 'timestamp'/*,
    default: () => "CURRENT_TIMESTAMP()"*/
  })
  createdAt: Date;

  @ManyToMany(() => User, user => user.chats)
  participants: User[];

  @OneToMany(() => Message, messages => messages.chat_id)
  messages: Message[];


}