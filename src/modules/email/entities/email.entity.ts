import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { EmailType } from "./email-type.entity";
import { EmailStatus } from "./email-status.entity";

@Entity({name: "email"})
export class Email {
  @PrimaryGeneratedColumn()
  public id: string

  @Column()
  public title: string

  @Column()
  public content: string

  @Column({ name: 'type_id', nullable: true })
  public typeId: string

  @ManyToOne(() => EmailType, (emailType) => emailType.emails, {
    eager: true
  })
  @JoinColumn({ name: 'type_id' })
  public type: EmailType

  @Column({ name: 'status_id', nullable: true })
  public statusId: string

  @ManyToOne(() => EmailStatus, (emailStatus) => emailStatus.emails, {
    eager: true
  })
  @JoinColumn({ name: 'status_id' })
  public status: EmailStatus

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
