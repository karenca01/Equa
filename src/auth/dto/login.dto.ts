import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  userEmail: string;

  @IsString()
  @MinLength(8)
  userPassword: string;
}