import { Common } from "src/modules/common/entities/common.entity";
import { Entity, OneToMany, JoinColumn } from "typeorm";
import { Generate } from "./generate.entity";

@Entity({name: "common"})
export class GenerateStatus extends Common {
  @OneToMany(() => Generate, generate => generate.status)
  @JoinColumn({ name: 'id' })
  public generates: Promise<Generate[]>
}