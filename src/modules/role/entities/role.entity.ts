import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  OneToMany,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { MultiLanguageText } from '../../../assets/typescripts/interface';
import { Employee } from '../../employee/entities/employee.entity';
import { Permission } from './permission.entity';

@Entity({name: "role"})
export class Role {

  @PrimaryGeneratedColumn()
  public id: string

  @Column()
  public type: string

  @Column({ name: "type_name" })
  public typeName: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;

  @OneToMany(() => Employee, employee => employee.role)
  @JoinColumn({ name: 'id' })
  public employees: Promise<Employee[]>

  @ManyToMany(() => Permission, permissions => permissions, {eager: true})
  @JoinTable({
    name: 'role_permission',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[]
}
