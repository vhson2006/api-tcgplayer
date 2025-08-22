import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class CreateEmailDto {
  @Type(() => String)
  @IsOptional()
  title: string;

  @Type(() => String)
  @IsOptional()
  content: string;

  @Type(() => String)
  @IsOptional()
  type: string;

  @Type(() => String)
  @IsOptional()
  status: string;
}
