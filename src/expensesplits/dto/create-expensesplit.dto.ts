import { IsString, IsNumber, IsUUID } from "class-validator";

export class CreateExpensesplitDto {
    @IsUUID()
    expenseSplitId: string;

    @IsNumber()
    expenseSplitAmount: number;

    @IsNumber()
    expenseSplitPercentage: number;
}
