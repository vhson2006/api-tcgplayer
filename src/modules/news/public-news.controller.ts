import { Controller, Get, Param, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { CORRECT } from 'src/assets/configs/app.constant';
import { NewsQueryDto } from './dto/query-news.dto';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('public-news')
export class PublicNewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async findAll(@Query() query: NewsQueryDto) {
    const news = await this.newsService.findAll(query);
    return {
      status: CORRECT,
      ...news
    }
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const news = await this.newsService.findOne(slug);
    return news
  }

}
