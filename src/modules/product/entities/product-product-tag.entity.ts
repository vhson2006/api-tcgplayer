import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity({name: "product_product_tag"})
export class ProductProductTag {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column({ name: "product_id" })
  public productId: string

  @Column({ name: "product_tag_id" })
  public productTagId: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
