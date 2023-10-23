import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, JoinTable, BeforeRemove, BeforeInsert } from "typeorm";
import { User } from "./User.js";

@Entity()
export class Contacts extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({length: 50, nullable: false})
    name: string;

    @ManyToOne(() => User, {eager: true})
//    @JoinTable()
    user: User;

    @ManyToOne(() => User, {eager: true, onDelete: 'SET NULL'})
    contact: User;


    @Column({
        type: 'enum',
        enum: ['blocked', 'normal'],
        default: 'normal'
    })
    relationshipStatus: 'blocked' | 'normal';

    @CreateDateColumn({
        type: 'timestamp'/*,
        default: () => "CURRENT_TIMESTAMP()"*/
    })
    createdAt: Date;

    @BeforeInsert()
    async hashPassword() {
      if (this.contact) {
        this.name = this.contact.username;
      }
    }


}