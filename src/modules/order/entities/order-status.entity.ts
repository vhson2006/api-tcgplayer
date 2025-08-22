import { Common } from "src/modules/common/entities/common.entity";
import { Entity, OneToMany, JoinColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity({name: "common"})
export class OrderStatus extends Common {
  @OneToMany(() => Order, order => order.status)
  @JoinColumn({ name: 'id' })
  public orders: Promise<Order[]>
}