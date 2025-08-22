import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class CreateProductDto {
  @Type(() => String)
  @IsOptional()
  name: string;

  @Type(() => String)
  @IsOptional()
  description: string;

  @Type(() => String)
  @IsOptional()
  price: string;

  @Type(() => String)
  @IsOptional()
  discount: string;

  @Type(() => String)
  @IsOptional()
  size: string;

  @Type(() => String)
  @IsOptional()
  quantity: string;

  @Type(() => String)
  @IsOptional()
  type: string;

  @Type()
  @IsOptional()
  selectedDates: any;

  @Type(() => String)
  @IsOptional()
  status: string;

  @Type(() => String)
  @IsOptional()
  category: string;

  @Type(() => Array<String>)
  @IsOptional()
  tags: string[];

  @Type(() => String)
  @IsOptional()
  image: string;

  @Type(() => Array<String>)
  @IsOptional()
  attributes: string[];
}
