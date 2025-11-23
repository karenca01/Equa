import { IsString, IsNumber, IsUUID, MaxLength, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateExpensesplitDto } from "../../expensesplits/dto/create-expensesplit.dto";

export class CreateExpenseDto {
  @IsString()
  @MaxLength(80)
  expenseDescription: string;

  @IsNumber()
  expenseAmount: number;

  @IsUUID()
  eventId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExpensesplitDto)
  splits: CreateExpensesplitDto[];
}
