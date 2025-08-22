import { Common } from "src/modules/common/entities/common.entity";
import { OneToMany, JoinColumn, Entity } from "typeorm";
import { Product } from "./product.entity";

@Entity({name: "common"})
export class ProductType extends Common {
  @OneToMany(() => Product, product => product.productType)
  @JoinColumn({ name: 'id' })
  public product: Promise<Product[]>
}