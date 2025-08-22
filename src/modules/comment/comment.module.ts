import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Comment } from './entities/comment.entity';
import { CommentStatus } from './entities/comment-status.entity';
import { CommentType } from './entities/comment-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentStatus, CommentType])
  ],
  controllers: [CommentController],
  providers: [CommentService, I18nService],
})
export class CommentModule {}
