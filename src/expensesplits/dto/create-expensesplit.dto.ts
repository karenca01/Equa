import { IsUUID, IsNumber, IsOptional } from "class-validator";

export class CreateExpensesplitDto {
    @IsUUID()
    expenseId: string;

    @IsUUID()
    userId: string;

    @IsNumber()
    @IsOptional()
    expenseSplitAmount?: number;

    @IsNumber()
    @IsOptional()
    expenseSplitPercentage?: number;
}