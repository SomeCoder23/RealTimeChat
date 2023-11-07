import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, CreateDateColumn} from "typeorm";
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

    @ManyToMany(() => Message, (message) => message.userChats, {eager: true})
    @JoinTable()
    messages: Message[];

    @CreateDateColumn({ type: 'timestamp'})
    lastEntry: Date;

}