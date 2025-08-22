import { Tag } from "src/modules/tag/entities/tag.entity";
import { Entity, JoinTable, ManyToMany } from "typeorm";
import { Product } from "./product.entity";

@Entity({name: "tag"})
export class ProductTag extends Tag {
  @ManyToMany(() => Product, product => product)
  @JoinTable({
    name: 'product_product_tag',
    joinColumn: {
      name: 'product_tag_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  product: Promise<Product[]>
}
