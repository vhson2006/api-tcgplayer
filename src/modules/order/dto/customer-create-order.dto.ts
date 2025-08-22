import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class CustomerCreateOrderDto {
  
  @Type(() => Array)
  @IsOptional()
  products: any;

}
