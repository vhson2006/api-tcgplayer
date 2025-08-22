import { Entity, JoinColumn, OneToMany } from "typeorm";
import { Media } from "./media.entity";
import { Common } from "src/modules/common/entities/common.entity";

@Entity({name: "common"})
export class MediaStatus extends Common {
  @OneToMany(() => Media, media => media.status)
  @JoinColumn({ name: 'id' })
  public medias: Promise<Media[]>
}