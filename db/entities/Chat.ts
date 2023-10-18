import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { User } from "./User.js";
import { Message } from "./Message.js";

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 100, nullable: true, default: "Unknown101"})
  name: string;

  @Column({ length: 255, nullable: true, default: "Some chat room...have fun chatting :)"})
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

  @ManyToMany(() => User, { cascade: true, eager: true})
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, messages => messages.chat_id, { cascade: true, eager: true, nullable: true})
  messages: Message[];


}