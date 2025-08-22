import { Common } from "src/modules/common/entities/common.entity";
import { OneToMany, JoinColumn, Entity } from "typeorm";
import { Email } from "./email.entity";

@Entity({name: "common"})
export class EmailStatus extends Common {
  @OneToMany(() => Email, email => email.status)
  @JoinColumn({ name: 'id' })
  public emails: Promise<Email[]>
}