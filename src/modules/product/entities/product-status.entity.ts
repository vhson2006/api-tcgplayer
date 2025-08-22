import { Common } from "src/modules/common/entities/common.entity";
import { OneToMany, JoinColumn, Entity } from "typeorm";
import { Product } from "./product.entity";

@Entity({name: "common"})
export class ProductStatus extends Common {
  @OneToMany(() => Product, product => product.productStatus)
  @JoinColumn({ name: 'id' })
  public product: Promise<Product[]>
}