import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
} from 'typeorm';

@Entity({name: "common"})
export class Common {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column()
  public group: string

  @Column()
  public type: string

  @Column({ name: "group_name", nullable: true})
  public groupName: string

  @Column({ name: "type_name", nullable: true})
  public typeName: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;

}
