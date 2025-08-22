import { Tag } from "src/modules/tag/entities/tag.entity";
import { Entity, JoinTable, ManyToMany } from "typeorm";
import { News } from "./news.entity";

@Entity({name: "tag"})
export class NewsTag extends Tag {
  @ManyToMany(() => News, news => news)
  @JoinTable({
    name: 'news_news_tag',
    joinColumn: {
      name: 'news_tag_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'news_id',
      referencedColumnName: 'id',
    },
  })
  news: Promise<News[]>
}
