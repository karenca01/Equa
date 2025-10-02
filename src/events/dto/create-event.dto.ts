import { IsString, MaxLength } from "class-validator";

export class CreateEventDto {
    @IsString()
    eventName: string;

    @IsString()
    @MaxLength(200)
    eventDescription: string;

    @IsString()
    eventType: string;
}
