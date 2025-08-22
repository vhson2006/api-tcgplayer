import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateNewsDto {
  @Type(() => String)
  @IsNotEmpty()
  title: string;

  @Type(() => String)
  @IsNotEmpty()
  content: string;

  @Type(() => String)
  @IsNotEmpty()
  predefine: string;

  @Type(() => String)
  @IsOptional()
  author: string;

  @Type(() => String)
  @IsOptional()
  category: string;

  @IsOptional()
  tags: any;

  @Type(() => String)
  @IsOptional()
  image: string;
}
