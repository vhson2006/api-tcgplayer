import { Common } from "src/modules/common/entities/common.entity";
import { OneToMany, JoinColumn, Entity } from "typeorm";
import { AccessCode } from "./access-code.entity";

@Entity({name: "common"})
export class AccessCodeType extends Common {
  @OneToMany(() => AccessCode, accessCode => accessCode.type)
  @JoinColumn({ name: 'id' })
  public accessCodes: Promise<AccessCode[]>
}