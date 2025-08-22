import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {


  @Type(() => String)
  @IsOptional()
  lang: string;

  
}
