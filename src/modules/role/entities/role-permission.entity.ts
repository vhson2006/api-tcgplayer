import { 
  Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';

@Entity({name: "role_permission"})
export class RolePermission {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column({ name: "role_id" })
  public roleId: string

  @Column({ name: "permission_id" })
  public permissionId: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
