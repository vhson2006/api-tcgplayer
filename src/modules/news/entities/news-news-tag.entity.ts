import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity({name: "news_news_tag"})
export class NewsNewsTag {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column({ name: "news_id" })
  public newsId: string

  @Column({ name: "news_tag_id" })
  public newsTagId: string

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
