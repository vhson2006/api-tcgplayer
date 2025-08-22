import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  password: string;
}