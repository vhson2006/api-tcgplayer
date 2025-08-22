import { Common } from "src/modules/common/entities/common.entity";
import { Entity, JoinColumn, OneToMany } from "typeorm";
import { Tag } from "./tag.entity";

@Entity({name: "common"})
export class TagGroup extends Common {
  @OneToMany(() => Tag, tag => tag.group)
  @JoinColumn({ name: 'id' })
  public tags: Promise<Tag[]>
}