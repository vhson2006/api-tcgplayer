import { Entity, JoinColumn, OneToMany } from "typeorm";
import { Media } from "src/modules/media/entities/media.entity";
import { News } from "./news.entity";

@Entity({name: "media"})
export class NewsImage extends Media {
  @OneToMany(() => News, news => news.image)
  @JoinColumn({ name: 'id' })
  public news: Promise<News[]>
}