import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { TagGroup } from './tag-group.entity';

@Entity({name: "tag"})
export class Tag {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column({ name: "group_id" })
  public groupId: string

  @Column()
  public type: string

  @Column({ name: "type_name", nullable: true})
  public typeName: string

  @ManyToOne(() => TagGroup, (tagGroup: any) => tagGroup.tags, {
    eager: true
  })
  @JoinColumn({ name: 'group_id' })
  public group: TagGroup

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;

}
