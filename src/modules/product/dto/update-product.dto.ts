import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @Type(() => Array<String>)
  @IsOptional()
  removeImages: string[];
}
