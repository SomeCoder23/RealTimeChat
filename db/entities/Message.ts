import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.js";
import { Chat } from "./Chat.js";

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 255, nullable: false })
  content: string;

  @Column({
    nullable: false, 
    type: 'enum', 
    enum: ['text', 'attachment'], 
    default: 'text'
  })
  type: "text" | "attachment";

  @CreateDateColumn({ type: 'timestamp', /*default: () => 'CURRENT_TIMESTAMP',*/ nullable: false })
  timeSent: Date;

  @ManyToOne(() => User)
  sender: string;

  @ManyToOne(() => Chat, chat => chat.messages)
  chat_id: number;


}