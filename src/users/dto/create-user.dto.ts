import { IsEmail, IsObject, IsString, Min, MinLength, IsOptional } from "class-validator";
import { Event } from "../../events/entities/event.entity";

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