import { BaseEntity, Column, Entity, CreateDateColumn, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { Profile } from "./Profile.js";
import { Chat } from "./Chat.js";

@Entity()
export class User extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({length: 50, nullable: false})
    username: string;

    @Column({nullable: false})
    password: string;

    @Column({
      type: 'date'/*,
      default: () => 'CURRENT_DATE',*/
    })
    createdAt: Date;

    @OneToOne(() => Profile, { cascade: true, eager: true })
    @JoinColumn()
    profile: Profile;

    @ManyToMany(() => Chat, chat => chat.participants)
    chats: Chat[];

 
}