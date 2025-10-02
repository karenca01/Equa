import { IsNumber, IsString, MaxLength, IsObject, IsOptional } from "class-validator";
import { User } from "../../users/entities/user.entity";
import { Event } from "../../events/entities/event.entity";
import { Expensesplit } from "../../expensesplits/entities/expensesplit.entity";

export class CreateExpenseDto {
    @IsString()
    expenseId: string;

    @IsString()
    @MaxLength(80)
    expenseDescription: string;    

    @IsNumber()
    expenseAmount: number;

    @IsObject()
    @IsOptional()
    paidBy: User;

    @IsObject()
    @IsOptional()
    event: Event;

    @IsObject()
    @IsOptional()
    splits: Expensesplit[];
}
