import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { MultiLanguageText } from '../../../assets/typescripts/interface';
import { Role } from './role.entity';

@Entity({name: "permission"})
export class Permission {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column()
  public group: string

  @Column()
  public type: string

  @Column({ name: "group_name" })
  public groupName: string

  @Column({ name: "type_name" })
  public typeName: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;

  @ManyToMany(() => Role, roles => roles)
  @JoinTable({
    name: 'role_permission',
    joinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Promise<Role[]>
}
