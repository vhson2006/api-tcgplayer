import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Entity, ManyToOne, JoinColumn } from "typeorm"
import { VoucherType } from "./voucher-type.entity"
import { ConditionType } from "./condition-type.entity"
import { VoucherStatus } from "./voucher-status.entity"

@Entity({name: "voucher"})
export class Voucher {
  @PrimaryGeneratedColumn()
  public id: string

  @Column()
  public code: string

  @Column({ nullable: true })
  public value: string

  @Column({ nullable: true })
  public min: string

  @Column()
  public max: string

  @Column({ name: "status_id", nullable: true })
  public statusId: string

  @ManyToOne(() => VoucherStatus, (voucherStatus) => voucherStatus.vouchers, {
    eager: true
  })
  @JoinColumn({ name: 'status_id' })
  public status: VoucherStatus

  @Column({ name: 'type_id', nullable: true })
  public typeId: string

  @ManyToOne(() => VoucherType, (voucherType) => voucherType.vouchers, {
    eager: true
  })
  @JoinColumn({ name: 'type_id' })
  public type: VoucherType

  @Column({ name: "condition_type_id", nullable: true })
  public conditionTypeId: string

  @ManyToOne(() => ConditionType, (conditionType) => conditionType.vouchers, {
    eager: true
  })
  @JoinColumn({ name: 'condition_type_id' })
  public conditionType: ConditionType

  @Column({ name: 'condition_value', nullable: true })
  public conditionValue: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
