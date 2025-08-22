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
import { CategoryGroup } from './category-group.entity';

@Entity({name: "category"})
export class Category {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column({ name: "group_id" })
  public groupId: string

  @Column()
  public type: string

  @Column({ name: "type_name", nullable: true})
  public typeName: string

  @ManyToOne(() => CategoryGroup, (categoryGroup: any) => categoryGroup.categories, {
    eager: true
  })
  @JoinColumn({ name: 'group_id' })
  public group: CategoryGroup

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;

}
