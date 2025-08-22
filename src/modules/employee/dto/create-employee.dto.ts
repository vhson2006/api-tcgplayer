import { Type } from "class-transformer";
import { IsOptional } from "class-validator";
import { UpdateEmployeeDto } from "./update-employee.dto";
import { PartialType } from "@nestjs/swagger";

export class CreateEmployeeDto extends PartialType(UpdateEmployeeDto) {
  @Type(() => String)
  @IsOptional()
  password: string;
}
