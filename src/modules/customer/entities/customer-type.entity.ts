import { Common } from "src/modules/common/entities/common.entity";
import { Entity, JoinColumn, OneToMany } from "typeorm";
import { Customer } from "./customer.entity";

@Entity({name: "common"})
export class CustomerType extends Common {
  @OneToMany(() => Customer, customer => customer.type)
  @JoinColumn({ name: 'id' })
  public customers: Promise<Customer[]>
}