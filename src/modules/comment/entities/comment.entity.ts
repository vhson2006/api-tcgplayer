import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm"
import { CommentStatus } from "./comment-status.entity"
import { CommentType } from "./comment-type.entity"

@Entity({name: "comment"})
export class Comment {
  @PrimaryGeneratedColumn()
  public id: string

  @Column()
  public name: string

  @Column({ nullable: true })
  public comment: string

  @Column({ name: "status_id", nullable: true })
  public statusId: string

  @ManyToOne(() => CommentType, (commentType) => commentType.comments, {
    eager: true
  })
  @JoinColumn({ name: 'status_id' })
  public status: CommentStatus

  @Column({ name: "type_id", nullable: true })
  public typeId: string

  @ManyToOne(() => CommentType, (commentType) => commentType.comments, {
    eager: true
  })
  @JoinColumn({ name: 'type_id' })
  public type: CommentType

  @Column({ name: "parent_id", nullable: true })
  public parentId: string

  @Column({ name: "post_slug", nullable: true })
  public postSlug: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
