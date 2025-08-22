import { Controller, Get, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryQueryDto } from './dto/query-category.dto';
import { CORRECT } from 'src/assets/configs/app.constant';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('public-category')
export class PublicCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(@Query() query: CategoryQueryDto) {
    const categories = await this.categoryService.findAll(query);
    return {
      status: CORRECT,
      ...categories
    }
  }

}
