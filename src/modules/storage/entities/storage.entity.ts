import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { MultiLanguageText } from '../../../assets/typescripts/interface';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity({name: "storage"})
export class Storage {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column()
  public name: string

  @Column()
  public description: string

  @Column()
  public attribute: string

  @Column()
  public effect: string

  @Column()
  public level: string

  @Column()
  public info: string

  @Column()
  public atk: string

  @Column()
  public def: string

  @Column()
  public serial: string//card_number

  @Column()
  public signal: string

  @Column()
  public rarity: string

  @Column()
  public release: string//time

  @Column()
  public pack: string//pack_name

  @Column()
  public link: string

  @Column()
  public image: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;

  @OneToMany(() => Product, product => product.storageId)
  @JoinColumn({ name: 'id' })
  public product: Promise<Product[]>

}
