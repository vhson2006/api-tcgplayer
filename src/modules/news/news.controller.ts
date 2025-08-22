import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { CORRECT } from 'src/assets/configs/app.constant';
import { CREATE, VIEW, UPDATE, DELETE } from 'src/assets/configs/app.permission';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { News } from './entities/news.entity';
import { NewsQueryDto } from './dto/query-news.dto';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';

@Auth(AuthType.Bearer)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Permissions(`${CREATE.GROUP}.${VIEW.NEWS}`)
  @Post()
  async create(@Body() createNewsDto: CreateNewsDto) {
    const response = await this.newsService.create(createNewsDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.NEWS}`)
  @Get()
  async findAll(@Query() query: NewsQueryDto) {
    const news = await this.newsService.findAll(query);
    return {
      status: CORRECT,
      ...news
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.NEWS}`)
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const news = await this.newsService.findOne(slug);
    return news
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.NEWS}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(News)) news: News, 
    @Body() updateNewsDto: UpdateNewsDto
  ) {
    const response = await this.newsService.update(news, updateNewsDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.NEWS}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(News)) news: News) {
    const response = await this.newsService.remove(news);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
}
