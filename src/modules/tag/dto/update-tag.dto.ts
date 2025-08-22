import { PartialType } from '@nestjs/swagger';
import { CreateTagDto } from './create-tag.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdateTagDto extends PartialType(CreateTagDto) {
  @Type(() => String)
  @IsNotEmpty()
  lang: string;
}
