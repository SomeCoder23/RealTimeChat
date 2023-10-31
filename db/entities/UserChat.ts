import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany, JoinTable, CreateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import { User } from "./User.js";
import { Chat } from "./Chat.js";
import { Message } from "./Message.js";

@Entity()
export class UserChat extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ length: 100, nullable: true, default: "Unknown101"})
    name: string;

    @ManyToOne(() => User, {eager: true})
    user: User;
    
    @ManyToOne(() => Chat, {eager: true})
    chat: Chat;

    @Column({ 
        type: 'enum',
    enum: ['blocked', 'normal', 'muted'],
    default: 'normal'})
    status: "muted" | "normal" | 'blocked';

    @Column({ 
        type: 'enum',
    enum: ['admin', 'participant'],
    default: 'participant'})
    role: 'admin' | 'participant';

    //  @OneToMany(() => Message, messages => messages.chat_id, {eager: true, nullable: true})
    //  messages: Message[];

    @ManyToMany(() => Message, (message) => message.userChats, {eager: true})
    @JoinTable()
    messages: Message[];

    @CreateDateColumn({ type: 'timestamp'})
    lastEntry: Date;

    // @BeforeUpdate()
    // updateLastEntry() {
    //     // Retrieve the last message date and update lastEntry
    //     if (this.messages && this.messages.length > 0) {
    //         const lastMessage = this.messages[this.messages.length - 1];
    //         this.lastEntry = lastMessage.timeSent;
    //     }
    // }

}