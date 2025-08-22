import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm"
import { ProductCategory } from "./product-category.entity"
import { ProductTag } from "./product-tag.entity"
import { ProductType } from "./product-type.entity"
import { ProductStatus } from "./product-status.entity"
import { ProductImage } from "./product-image.entity"
import { Attribute } from "./attribute.entity"
import { Order } from "src/modules/order/entities/order.entity"
import { Storage } from "src/modules/storage/entities/storage.entity"

@Entity({name: "product"})
export class Product {
  @PrimaryGeneratedColumn()
  public id: string

  @Column()
  public name: string

  @Column()
  public description: string

  @Column({ nullable: true })
  public slug: string

  @Column({ nullable: true })
  public price: string

  @Column({ nullable: true })
  public discount: string

  @Column({ name: 'promotion_price', nullable: true })
  public promotionPrice: string

  @Column({ nullable: true })
  public extra: string

  @Column({ nullable: true })
  public quantity: string

  @Column({ nullable: true })
  public starttime: string

  @Column({ nullable: true })
  public endtime: string

  @Column({ name: 'status_id', nullable: true })
  public statusId: string

  @ManyToOne(() => ProductStatus, (productStatus) => productStatus.product, {
    eager: true
  })
  @JoinColumn({ name: 'status_id' })
  public productStatus: ProductStatus

  @Column({ name: 'type_id', nullable: true })
  public typeId: string

  @ManyToOne(() => ProductType, (productType) => productType.product, {
    eager: true
  })
  @JoinColumn({ name: 'type_id' })
  public productType: ProductType

  @Column({ name: "category_id", nullable: true })
  public categoryId: string

  @ManyToOne(() => ProductCategory, (productCategory) => productCategory.product, {
    eager: true
  })
  @JoinColumn({ name: 'category_id' })
  public productCategory: ProductCategory

  @Column({ name: 'storage_id', nullable: true })
  public storageId: string

  @ManyToOne(() => Storage, (storage) => storage.product, {
    eager: true
  })
  @JoinColumn({ name: 'storage_id' })
  public storage: Storage
  
  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;

  @ManyToMany(() => ProductTag, productTag => productTag, {eager: true})
  @JoinTable({
    name: 'product_product_tag',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_tag_id',
      referencedColumnName: 'id',
    },
  })
  productTags: ProductTag[]

  @ManyToMany(() => ProductImage, productImage => productImage, {eager: true})
  @JoinTable({
    name: 'product_product_image',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_image_id',
      referencedColumnName: 'id',
    },
  })
  productImages: ProductImage[]

  @ManyToMany(() => Attribute, attribute => attribute, {eager: true})
  @JoinTable({
    name: 'product_attribute',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attribute_id',
      referencedColumnName: 'id',
    },
  })
  productAttributes: Attribute[]

  @ManyToMany(() => Order, order => order)
  @JoinTable({
    name: 'order_product',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'order_id',
      referencedColumnName: 'id',
    },
  })
  orders: Promise<Order[]>
}
