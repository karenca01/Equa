import { IsObject, IsOptional, IsString, MaxLength, IsIn } from "class-validator";
import { User } from "../../users/entities/user.entity";
import { Event } from "../../events/entities/event.entity";

export class CreateEventDto {
    @IsString()
    eventName: string;

    @IsString()
    @MaxLength(200)
    eventDescription: string;

    @IsIn(['Private', 'Public'])
    @IsOptional()
    eventType: string;

    @IsObject()
    @IsOptional()
    createdBy: User;
}
