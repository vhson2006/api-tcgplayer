import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateRoleDto {
  
  @Type(() => String)
  @IsNotEmpty()
  name: string;

  @Type(() => String)
  @IsNotEmpty()
  type: string;

  @Type(() => Array<any>)
  @IsNotEmpty()
  permissions: any[];
}
