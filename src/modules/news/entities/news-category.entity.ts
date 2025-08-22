import { Category } from "src/modules/category/entities/category.entity";
import { Entity, OneToMany, JoinColumn } from "typeorm";
import { News } from "./news.entity";

@Entity({name: "category"})
export class NewsCategory extends Category {
  @OneToMany(() => News, news => news.newsCategory)
  @JoinColumn({ name: 'id' })
  public news: Promise<News[]>
}
