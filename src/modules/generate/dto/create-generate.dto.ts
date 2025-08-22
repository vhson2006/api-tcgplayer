import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class CreateGenerateDto {
  @Type(() => String)
  @IsOptional()
  command: string;

  @Type(() => String)
  @IsOptional()
  status: string;
}
