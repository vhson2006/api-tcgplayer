import { Common } from "src/modules/common/entities/common.entity";
import { OneToMany, JoinColumn, Entity } from "typeorm";
import { Email } from "./email.entity";

@Entity({name: "common"})
export class EmailType extends Common {
  @OneToMany(() => Email, email => email.type)
  @JoinColumn({ name: 'id' })
  public emails: Promise<Email[]>
}