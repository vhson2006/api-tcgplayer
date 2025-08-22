import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class CreateAccessCodeDto {
  @Type(() => String)
  @IsOptional()
  code: string;

  @Type(() => String)
  @IsOptional()
  times: string;

  @Type(() => String)
  @IsOptional()
  type: string;

  @Type(() => String)
  @IsOptional()
  status: string;

  @Type()
  @IsOptional()
  selectedDates: any;
}
