import { 
  Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, 
  ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn 
} from "typeorm";
import { Product } from "./product.entity";

@Entity({name: "attribute"})
export class Attribute {
  @PrimaryGeneratedColumn()
  public id: string

  @Column()
  public type: string

  @Column({ name: "type_name" })
  public typeName: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;

  @ManyToMany(() => Product, product => product)
  @JoinTable({
    name: 'product_attribute',
    joinColumn: {
      name: 'attribute_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  product: Promise<Product[]>
}