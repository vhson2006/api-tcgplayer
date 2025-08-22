import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ValidateTokenType } from './validate-token-type.entity';

@Entity({name: "validate_token"})
export class ValidateToken {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column()
  public identify: string

  @Column()
  public pin: string
  
  @Column({ name: 'type_id' })
  public typeId: string

  @ManyToOne(() => ValidateTokenType, (validateTokenType) => validateTokenType.validateTokens, {
    eager: true
  })
  @JoinColumn({ name: 'type_id' })
  public type: ValidateTokenType

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
