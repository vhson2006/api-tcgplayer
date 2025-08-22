import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateStorageDto {
  
  @Type(() => String)
  @IsNotEmpty()
  name: string;

}
