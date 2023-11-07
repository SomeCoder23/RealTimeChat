import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

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
    type: 'timestamp'
  })
  createdAt: Date;
}