import { IsString, IsNumber, IsUUID, IsObject, IsOptional } from "class-validator";
import { User } from "../../users/entities/user.entity";
import { Expense } from "../../expenses/entities/expense.entity";

export class CreateExpensesplitDto {
    @IsUUID()
    expenseSplitId: string;

    @IsObject()
    @IsOptional()
    expense: Expense;

    @IsObject()
    @IsOptional()
    user: User;

    @IsNumber()
    expenseSplitAmount: number;

    @IsNumber()
    expenseSplitPercentage: number;
}
