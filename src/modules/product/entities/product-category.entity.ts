import { Category } from "src/modules/category/entities/category.entity";
import { Entity, OneToMany, JoinColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({name: "category"})
export class ProductCategory extends Category {
  @OneToMany(() => Product, product => product.productCategory)
  @JoinColumn({ name: 'id' })
  public product: Promise<Product[]>
}
