import { PartialType } from '@nestjs/swagger';
import { CreateNewsDto } from './create-news.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @Type(() => String)
  @IsNotEmpty()
  lang: string;
}
