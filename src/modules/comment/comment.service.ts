import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { CORRECT, INCORRECT, DEFAULT_SIZE, MAX_SIZE, DEFAULT_PAGE } from 'src/assets/configs/app.constant';
import { I18nService } from 'src/middlewares/globals/i18n/i18n.service';
import { Repository, DataSource } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CommentQueryDto } from './dto/query-comment.dto';
import { Comment } from './entities/comment.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class CommentService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
    @InjectDataSource() private dataSource: DataSource
  ) {}


  async findAll(query: CommentQueryDto) {
    try {
      const { search, page, size } = query;
      let queryObj: any = {
        skip: Math.min(size || DEFAULT_SIZE, MAX_SIZE) * ((page || DEFAULT_PAGE) - 1),
        take: Math.min(size || DEFAULT_SIZE, MAX_SIZE)
      }
      if (search) {
        queryObj = {
          ...queryObj, 
          where: [
            // { slug: Like(`%${search}%`) },
            // { name: Like(`%${search}%`) },
            // { description: Like(`%${search}%`) },
          ],
        }
      }
      const response = await this.commentRepository.findAndCount(queryObj);
      return {
        data: response[0],
        total: response[1]
      }
    } catch (e) {
      this.logger.error(`${JSON.stringify(e)}`);
      throw new BadRequestException(this.i18nService.translate('ERRORS.BAD_REQUEST'));
    }
  }
}
