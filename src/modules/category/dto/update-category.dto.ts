import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @Type(() => String)
  @IsNotEmpty()
  lang: string;
}
