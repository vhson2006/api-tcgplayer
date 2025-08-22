import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { MediaStatus } from './media-status.entity';

@Entity({name: "media"})
export class Media {

  @PrimaryGeneratedColumn()
  public id: string
  
  @Column({ nullable: true })
  public name: string

  @Column({ nullable: true })
  public url: string

  @Column({ nullable: true })
  public alt: string

  @Column({ name: 'file_type', nullable: true })
  public fileType: string

  @Column({ name: 'status_id', nullable: true })
  public statusId: string

  @ManyToOne(() => MediaStatus, (mediaStatus) => mediaStatus.medias, {
    eager: true
  })
  @JoinColumn({ name: 'status_id' })
  public status: MediaStatus
  
  @CreateDateColumn()
  public created!: Date;

  @UpdateDateColumn()
  public updated!: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted?: Date;

 

}
