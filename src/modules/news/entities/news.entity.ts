import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinTable, ManyToMany } from "typeorm"
import { NewsCategory } from "./news-category.entity"
import { NewsTag } from "./news-tag.entity"
import { NewsImage } from "./news-image.entity"

@Entity({name: "news"})
export class News {
  @PrimaryGeneratedColumn()
  public id: string

  @Column({ nullable: true })
  public slug: string

  @Column()
  public predefine: string

  @Column()
  public title: string

  @Column()
  public content: string

  @Column()
  public author: string

  @Column({ name: "image_id", nullable: true })
  public imageId: string

  @ManyToOne(() => NewsImage, (newsImage) => newsImage.news, {
    eager: true
  })
  @JoinColumn({ name: 'image_id' })
  public image: NewsImage

  @Column({ name: "category_id", nullable: true })
  public categoryId: string

  @ManyToOne(() => NewsCategory, (newsCategory) => newsCategory.news, {
    eager: true
  })
  @JoinColumn({ name: 'category_id' })
  public newsCategory: NewsCategory

  @ManyToMany(() => NewsTag, newsTag => newsTag, {eager: true})
  @JoinTable({
    name: 'news_news_tag',
    joinColumn: {
      name: 'news_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'news_tag_id',
      referencedColumnName: 'id',
    },
  })
  newsTags: NewsTag[]

  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;
}
