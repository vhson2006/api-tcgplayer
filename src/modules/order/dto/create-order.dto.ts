import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class CreateOrderDto {

  @Type(() => String)
  @IsOptional()
  phone: string;

  @Type(() => String)
  @IsOptional()
  address: string;

  @Type(() => String)
  @IsOptional()
  status: string;
  
  @Type(() => String)
  @IsOptional()
  paymentType: string;

  @Type(() => String)
  @IsOptional()
  paymentStatus: string;
  
  @Type(() => String)
  @IsOptional()
  products: any;

  @IsOptional()
  customerId: any;
}
