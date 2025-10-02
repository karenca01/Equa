import { IsNumber, IsString, MaxLength } from "class-validator";

export class CreateExpenseDto {
    @IsString()
    expenseId: string;

    @IsString()
    @MaxLength(80)
    expenseDescription: string;    

    @IsNumber()
    expenseAmount: number;
}
