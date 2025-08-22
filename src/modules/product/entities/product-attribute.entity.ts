import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn 
} from "typeorm";

@Entity({name: "product_attribute"})
export class ProductAttribute {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column({ name: "product_id" })
  public productId: string

  @Column({ name: "attribute_id" })
  public attributeId: string

  @Column()
  public value: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}