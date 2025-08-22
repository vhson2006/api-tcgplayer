import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity({name: "order_product"})
export class OrderProduct {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column({ name: "product_id" })
  public productId: string

  @Column({ name: "order_id" })
  public orderId: string

  @Column({ default: 1 })
  public quantity: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
