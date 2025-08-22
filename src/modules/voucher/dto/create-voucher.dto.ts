import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class CreateVoucherDto {
  @Type(() => String)
  @IsOptional()
  code: string;

  @Type(() => String)
  @IsOptional()
  value: string;

  @Type(() => String)
  @IsOptional()
  min: string;

  @Type(() => String)
  @IsOptional()
  max: string;

  @Type(() => String)
  @IsOptional()
  type: string;

  @Type(() => String)
  @IsOptional()
  status: string;

  @Type(() => String)
  @IsOptional()
  conditionType: string;

  @Type(() => String)
  @IsOptional()
  conditionValue: string;
}
