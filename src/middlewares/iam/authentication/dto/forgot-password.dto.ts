import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  email: string;
}