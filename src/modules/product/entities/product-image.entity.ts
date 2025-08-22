import { Media } from "src/modules/media/entities/media.entity";
import { Entity, JoinTable, ManyToMany } from "typeorm";
import { Product } from "./product.entity";

@Entity({name: "media"})
export class ProductImage extends Media {
  @ManyToMany(() => Product, product => product)
  @JoinTable({
    name: 'product_product_image',
    joinColumn: {
      name: 'product_image_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  product: Promise<Product[]>
}