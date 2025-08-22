import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  pin: string;
}