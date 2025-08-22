import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class ActivateAccountDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  email: string;
}