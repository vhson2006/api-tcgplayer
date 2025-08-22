import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class CreateCategoryDto {
  @Type(() => String)
  @IsNotEmpty()
  type: string;

  @Type(() => String)
  @IsNotEmpty()
  name: string;

  @Type(() => String)
  @IsNotEmpty()
  group: string;
}
