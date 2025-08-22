import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm"
import { AccessCodeStatus } from "./access-code-status.entity"
import { AccessCodeType } from "./access-code-type.entity"

@Entity({name: "access_code"})
export class AccessCode {
  @PrimaryGeneratedColumn()
  public id: string

  @Column()
  public code: string

  @Column({ nullable: true })
  public times: string

  @Column({ name: "start_time", nullable: true })
  public startTime: string

  @Column({ name: "end_time", nullable: true })
  public endTime: string

  @Column({ name: "status_id", nullable: true })
  public statusId: string

  @ManyToOne(() => AccessCodeStatus, (emailStatus) => emailStatus.accessCodes, {
    eager: true
  })
  @JoinColumn({ name: 'status_id' })
  public status: AccessCodeStatus

  @Column({ name: "type_id", nullable: true })
  public typeId: string

  @ManyToOne(() => AccessCodeType, (emailType) => emailType.accessCodes, {
    eager: true
  })
  @JoinColumn({ name: 'type_id' })
  public type: AccessCodeType

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
