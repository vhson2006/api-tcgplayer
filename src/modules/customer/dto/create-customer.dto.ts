import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class CreateCustomerDto {
  @Type(() => String)
  @IsOptional()
  name: string;

  @Type(() => String)
  @IsOptional()
  phone: string;

  @Type(() => String)
  @IsOptional()
  address: string;

  @Type(() => String)
  @IsOptional()
  email: string;
}
