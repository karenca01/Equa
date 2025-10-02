import { IsEmail, IsString, Min, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    username: string;
    
    @IsString()
    userFullName: string;

    @IsString()
    @IsEmail()
    userEmail: string;

    @IsString()
    @MinLength(8)
    userPassword: string;
}
