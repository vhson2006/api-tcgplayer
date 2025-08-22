import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class CreateMediaDto {
  @Type(() => String)
  @IsOptional()
  name: string;

  @Type(() => String)
  @IsOptional()
  file: string;

  @Type(() => String)
  @IsOptional()
  alt: string;
}
