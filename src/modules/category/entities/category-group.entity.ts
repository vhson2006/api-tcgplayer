import { Common } from "src/modules/common/entities/common.entity";
import { Entity, JoinColumn, OneToMany } from "typeorm";
import { Category } from "./category.entity";

@Entity({name: "common"})
export class CategoryGroup extends Common {
  @OneToMany(() => Category, category => category.group)
  @JoinColumn({ name: 'id' })
  public categories: Promise<Category[]>
}