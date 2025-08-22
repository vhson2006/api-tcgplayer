import { Controller, Get, Query } from '@nestjs/common';
import { TagService } from './tag.service';
import { CORRECT } from 'src/assets/configs/app.constant';
import { TagQueryDto } from './dto/query-tag.dto';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('public-tag')
export class PublicTagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll(@Query() query: TagQueryDto) {
    const tags = await this.tagService.findAll(query);
    return {
      status: CORRECT,
      ...tags
    }
  }

}
