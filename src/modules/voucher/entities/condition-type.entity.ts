import { Common } from "src/modules/common/entities/common.entity";
import { OneToMany, JoinColumn, Entity } from "typeorm";
import { Voucher } from "./voucher.entity";

@Entity({name: "common"})
export class ConditionType extends Common {
  @OneToMany(() => Voucher, voucher => voucher.conditionType)
  @JoinColumn({ name: 'id' })
  public vouchers: Promise<Voucher[]>
}