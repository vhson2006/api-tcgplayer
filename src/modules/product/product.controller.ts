import { Controller, Get, Post, Body, Patch, Param, Delete, Query, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CREATE, DELETE, UPDATE, VIEW } from 'src/assets/configs/app.permission';
import { CORRECT, INCORRECT } from 'src/assets/configs/app.constant';
import { EntityExistsPipe } from 'src/middlewares/globals/entity-exists.pipe';
import { Product } from './entities/product.entity';
import { Permissions } from 'src/middlewares/iam/authorization/decorators/permission.decoration';
import { ProductQueryDto } from './dto/query-product.dto';
import { Auth } from 'src/middlewares/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/middlewares/iam/authentication/enums/auth-type.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import * as csv  from 'csvtojson';

@Auth(AuthType.Bearer)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Permissions(`${CREATE.GROUP}.${VIEW.PRODUCT}`)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const response = await this.productService.create(createProductDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.PRODUCT}`)
  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    const product = await this.productService.findAll(query);
    
    return {
      status: CORRECT,
      ...product
    }
  }

  @Permissions(`${VIEW.GROUP}.${VIEW.PRODUCT}`)
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const product = await this.productService.findOne(slug);
    return product
  }

  @Permissions(`${UPDATE.GROUP}.${UPDATE.PRODUCT}`)
  @Patch(':id')
  async update(
    @Param('id', EntityExistsPipe(Product)) product: Product, 
    @Body() updateProductDto: UpdateProductDto
  ) {
    const response = await this.productService.update(product, updateProductDto);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }

  @Permissions(`${DELETE.GROUP}.${DELETE.PRODUCT}`)
  @Delete(':id')
  async remove(@Param('id', EntityExistsPipe(Product)) product: Product) {
    const response = await this.productService.remove(product);
    if (CORRECT === response) {
      return { status: CORRECT }
    }
    return response
  }
  
  @Permissions(`${CREATE.GROUP}.${CREATE.PRODUCT}`)
  @Post('import')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }), // 10MB
          new FileTypeValidator({ fileType: 'text/csv' }),
        ]
      })
    ) file: Express.Multer.File): Promise<any> {
      const { path, } = file
      const jsonArray = await csv().fromFile(path);

      await this.productService.importProduct(jsonArray)
      return {
        status: CORRECT,
      }
    }
}


