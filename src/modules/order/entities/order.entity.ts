import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne, JoinTable, ManyToMany } from "typeorm";
import { PaymentType } from "./payment-type.entity";
import { PaymentStatus } from "./payment-status.entity";
import { Product } from "src/modules/product/entities/product.entity";
import { OrderStatus } from "./order-status.entity";

@Entity({name: "order"})
export class Order {
  @PrimaryGeneratedColumn()
  public id: string

  @Column()
  public serial: string

  @Column({ nullable: true })
  public phone: string

  @Column({ nullable: true })
  public address: string

  @Column({ name: "customer_id", nullable: true })
  public customerId: string

  @Column({ name: 'status_id', nullable: true })
  public statusId: string

  @ManyToOne(() => OrderStatus, (orderStatus) => orderStatus.orders, {
    eager: true
  })
  @JoinColumn({ name: 'status_id' })
  public status: OrderStatus

  @Column({ name: 'payment_type_id', nullable: true })
  public paymentTypeId: string

  @ManyToOne(() => PaymentType, (paymentType) => paymentType.orders, {
    eager: true
  })
  @JoinColumn({ name: 'payment_type_id' })
  public paymentType: PaymentType

  @Column({ name: 'payment_status_id', nullable: true })
  public paymentStatusId: string

  @ManyToOne(() => PaymentStatus, (productStatus) => productStatus.orders, {
    eager: true
  })
  @JoinColumn({ name: 'payment_status_id' })
  public paymentStatus: PaymentStatus

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;

  @ManyToMany(() => Product, product => product, {eager: true})
  @JoinTable({
    name: 'order_product',
    joinColumn: {
      name: 'order_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  products: Product[]
}
