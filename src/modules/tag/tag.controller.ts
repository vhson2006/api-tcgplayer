import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CORRECT } from 'src/assets/configs/app.constant';
import { TagQueryDto } from './dto/query-tag.dto';
import { Tag } from './entities/tag.entity';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { CREATE, DELETE, UPDATE, VIEW } from 'src/assets/configs/app.permission';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';

@Auth(AuthType.Bearer)
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Permissions(`${CREATE.GROUP}.${CREATE.TAG}`)
  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    const response = await this.tagService.create(createTagDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.TAG}`)
  @Get()
  async findAll(@Query() query: TagQueryDto) {
    const tags = await this.tagService.findAll(query);
    return {
      status: CORRECT,
      ...tags
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.TAG}`)
  @Get(':id')
  findOne(@Param('id', EntityExistsPipe(Tag)) tag: Tag) {
    return {
      status: CORRECT,
      data: tag
    }
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.TAG}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(Tag)) tag: Tag, 
    @Body() updateTagDto: UpdateTagDto
  ) {
    const response = await this.tagService.update(tag, updateTagDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.TAG}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(Tag)) tag: Tag) {
    const response = await this.tagService.remove(tag);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
}
