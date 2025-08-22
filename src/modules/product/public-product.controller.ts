import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CORRECT } from 'src/assets/configs/app.constant';
import { ProductQueryDto } from './dto/query-product.dto';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('public-product')
export class PublicProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    const product = await this.productService.findAll(query);
    
    return {
      status: CORRECT,
      ...product
    }
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const product = await this.productService.findOne(slug);
    return product
  }
}
