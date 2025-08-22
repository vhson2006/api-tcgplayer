import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class EmployeeQueryDto {
  @Type(() => Number)
  @IsOptional()
  size: number;

  @Type(() => Number)
  @IsOptional()
  page: number;

  @Type(() => String)
  @IsOptional()
  search: string;

  @Type(() => String)
  @IsOptional()
  role: string;

  @Type(() => String)
  @IsOptional()
  status: string;
}