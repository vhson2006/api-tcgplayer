import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class CreateCommentDto {
  @Type(() => String)
  @IsOptional()
  name: string;

  @Type(() => String)
  @IsOptional()
  comment: string;

  @Type(() => String)
  @IsOptional()
  status: string;

  @Type(() => String)
  @IsOptional()
  type: string;

  @Type(() => String)
  @IsOptional()
  post: string;

  @Type(() => String)
  @IsOptional()
  parent: string;
}
