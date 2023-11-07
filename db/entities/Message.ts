import { BaseEntity, BeforeRemove, Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.js";
import { Chat } from "./Chat.js";
import { UserChat } from "./UserChat.js";

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 255, nullable: false })
  content: string;

  @Column({
    nullable: false, 
    type: 'enum', 
    enum: ['text', 'file', 'image'], 
    default: 'text'
  })
  type: "text" | "file" | 'image';

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  timeSent: Date;

  @ManyToOne(() => User, {eager: true, onDelete: 'SET NULL'})
  sender: string;

  @ManyToOne(() => Chat)
  chat_id: number;

  @ManyToMany(() => UserChat, (userChat) => userChat.messages)
  userChats: UserChat[];

  @BeforeRemove()
  private async beforeRemove() {
    if (this.sender) 
      this.sender = "Unknown";  
    await this.save(); 
  }


}