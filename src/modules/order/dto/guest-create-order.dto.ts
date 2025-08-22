import { Type } from "class-transformer";
import { IsOptional, IsNotEmpty } from "class-validator";

export class GuestCreateOrderDto {
  
  @Type(() => Array)
  @IsOptional()
  products: any;

  @Type(() => String)
  @IsNotEmpty()
  name: any;

  @Type(() => String)
  @IsNotEmpty()
  phone: any;

  @Type(() => String)
  @IsNotEmpty()
  address: any;

}
