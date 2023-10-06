import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.js";

@Entity()
export class Contacts extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => User)
    contact: User;

    @Column({
        type: 'enum',
        enum: ['blocked', 'muted', 'normal'],
        default: 'normal'
    })
    relationshipStatus: 'blocked' | 'muted' | 'normal';

    @CreateDateColumn({
        type: 'timestamp'/*,
        default: () => "CURRENT_TIMESTAMP()"*/
    })
    createdAt: Date;

}