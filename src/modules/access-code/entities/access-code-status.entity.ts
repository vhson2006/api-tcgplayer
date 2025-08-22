import { OneToMany, JoinColumn, Entity } from "typeorm";
import { AccessCode } from "./access-code.entity";
import { Common } from "src/modules/common/entities/common.entity";

@Entity({name: "common"})
export class AccessCodeStatus extends Common {
  @OneToMany(() => AccessCode, accessCode => accessCode.status)
  @JoinColumn({ name: 'id' })
  public accessCodes: Promise<AccessCode[]>
}