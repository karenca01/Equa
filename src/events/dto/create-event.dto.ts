import { IsOptional, IsString, MaxLength, IsIn } from "class-validator";

export class CreateEventDto {
    @IsString()
    eventName: string;

    @IsString()
    @MaxLength(200)
    eventDescription: string;

    @IsIn(['Private', 'Public'])
    @IsOptional()
    eventType: string;

    @IsString()
    @IsOptional()
    createdBy?: string;
}