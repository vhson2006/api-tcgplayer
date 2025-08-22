import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity({name: "product_product_image"})
export class ProductProductImage {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column({ name: "product_id" })
  public productId: string

  @Column({ name: "product_image_id" })
  public productImageId: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
