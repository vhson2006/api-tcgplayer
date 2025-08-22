import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UpdateEmployeeDto  {
  @Type(() => String)
  @IsOptional()
  name: string;

  @Type(() => String)
  @IsOptional()
  identified: string;

  @Type(() => String)
  @IsOptional()
  dob: string;

  @Type(() => File)
  @IsOptional()
  avatar: any;

  @Type(() => String)
  @IsOptional()
  username: string;

  @Type(() => String)
  @IsOptional()
  email: string;

  @Type(() => String)
  @IsOptional()
  phone: string;

  @Type(() => String)
  @IsOptional()
  address: string;

  @Type(() => String)
  @IsOptional()
  latitude: string;

  @Type(() => String)
  @IsOptional()
  longitude: string;

  @Type(() => String)
  @IsOptional()
  status: string;

  @Type(() => String)
  @IsOptional()
  role: string;
}
