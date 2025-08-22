import { Common } from "src/modules/common/entities/common.entity";
import { Entity, OneToMany, JoinColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity({name: "common"})
export class PaymentStatus extends Common {
  @OneToMany(() => Order, order => order.paymentStatus)
  @JoinColumn({ name: 'id' })
  public orders: Promise<Order[]>
}