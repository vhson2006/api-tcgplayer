import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { GenerateStatus } from "./generate-status.entity";

@Entity({name: "generate"})
export class Generate {
  @PrimaryGeneratedColumn()
  public id: string

  @Column()
  public command: string

  @Column({ name: 'status_id', nullable: true })
  public statusId: string

  @ManyToOne(() => GenerateStatus, (generateStatus) => generateStatus.generates, {
    eager: true
  })
  @JoinColumn({ name: 'status_id' })
  public status: GenerateStatus

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
