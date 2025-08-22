import { PartialType } from '@nestjs/swagger';
import { CreateMediaDto } from './create-media.dto';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UpdateMediaDto extends PartialType(CreateMediaDto) {
  @Type(() => String)
  @IsOptional()
  status: string;

  @Type(() => String)
  @IsOptional()
  fileType: string;
}
