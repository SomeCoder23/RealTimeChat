import { BaseEntity, Column, Entity, CreateDateColumn, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { Profile } from "./Profile.js";

@Entity()
export class User extends BaseEntity{
    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column({length: 50, nullable: false})
    userName: string;

    @Column({nullable: false})
    password: string;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP()"
      })
      createdAt: Date;

    // @OneToOne(() => Profile, { cascade: true, eager: true })
    // @JoinColumn()
    // profile: Profile;

 
}