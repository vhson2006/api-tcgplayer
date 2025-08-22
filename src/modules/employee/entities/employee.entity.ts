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
import { Role } from '../../role/entities/role.entity';
import { EmployeeStatus } from './employee-status.entity';
import { Media } from 'src/modules/media/entities/media.entity';
import { Avatar } from './avatar.entity';

@Entity({name: "employee"})
export class Employee {

  @PrimaryGeneratedColumn()
  public id: string

  @Column()
  public name: string

  @Column({ nullable: true })
  public identified: string

  @Column({ nullable: true })
  public username: string

  @Column({ nullable: true })
  public email: string

  @Column({ nullable: true })
  public phone: string

  @Column()
  public password: string

  @Column({ nullable: true })
  public address: string

  @Column({ nullable: true })
  public dob: string

  @Column({ nullable: true })
  public latitude: string

  @Column({ nullable: true })
  public longitude: string

  @Column({ name: "status_id" })
  public statusId: string

  @ManyToOne(() => EmployeeStatus, (emloyeeStatus) => emloyeeStatus.employees, {
    eager: true
  })
  @JoinColumn({ name: 'status_id' })
  public status: EmployeeStatus

  @Column({ name: "role_id" })
  public roleId: string

  @ManyToOne(() => Role, (role) => role.employees, {
    eager: true
  })
  @JoinColumn({ name: 'role_id' })
  public role: Role

  @Column({ name: "avatar_id", nullable: true })
  public avatarId: string
 
  @ManyToOne(() => Avatar, (avatar) => avatar.employees, {
    eager: true
  })
  @JoinColumn({ name: 'avatar_id' })
  public avatar: Avatar

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}