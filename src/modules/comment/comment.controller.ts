import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { Comment } from './entities/comment.entity';
import { CORRECT } from 'src/assets/configs/app.constant';
import { CREATE, VIEW, UPDATE, DELETE } from 'src/assets/configs/app.permission';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { CommentQueryDto } from './dto/query-comment.dto';

@Auth(AuthType.Bearer)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Permissions(`${VIEW.GROUP}.${VIEW.COMMENT}`)
  @Get()
  async findAll(@Query() query: CommentQueryDto) {
    const comment = await this.commentService.findAll(query);
    
    return {
      status: CORRECT,
      ...comment
    }
  }

}
