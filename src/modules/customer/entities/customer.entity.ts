import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { CustomerType } from "./customer-type.entity";

@Entity({name: "customer"})
export class Customer {
  @PrimaryGeneratedColumn()
  public id: string

  @Column()
  public name: string

  @Column()
  public email: string

  @Column()
  public password: string

  @Column({ nullable: true })
  public phone: string

  @Column({ nullable: true })
  public address: string

  @Column({ name: "type_id" })
  public typeId: string

  @ManyToOne(() => CustomerType, (customerType) => customerType.customers, {
    eager: true
  })
  @JoinColumn({ name: 'type_id' })
  public type: CustomerType

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
