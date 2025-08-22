import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/query-category.dto';
import { CORRECT } from 'src/assets/configs/app.constant';
import { Category } from './entities/category.entity';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { CREATE, DELETE, UPDATE, VIEW } from 'src/assets/configs/app.permission';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';

@Auth(AuthType.Bearer)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Permissions(`${CREATE.GROUP}.${CREATE.CATEGORY}`)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const response = await this.categoryService.create(createCategoryDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.CATEGORY}`)
  @Get()
  async findAll(@Query() query: CategoryQueryDto) {
    const categories = await this.categoryService.findAll(query);
    return {
      status: CORRECT,
      ...categories
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.CATEGORY}`)
  @Get(':id')
  async findOne(@Param('id', EntityExistsPipe(Category)) category: Category) {
    return {
      status: CORRECT,
      data: category
    }
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.CATEGORY}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(Category)) category: Category, 
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    const response = await this.categoryService.update(category, updateCategoryDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.CATEGORY}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(Category)) category: Category) {
    const response = await this.categoryService.remove(category);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
}
