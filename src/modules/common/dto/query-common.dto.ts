import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CommonQueryDto {
  @Type(() => String)
  @IsNotEmpty()
  group: string;
}
