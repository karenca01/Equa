import { IsUUID, IsObject, IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../users/entities/user.entity";
import { Expense } from "../../expenses/entities/expense.entity";

export class CreateExpensesplitDto {
  @IsUUID()
  @IsOptional()
  expenseSplitId?: string;

  @IsObject()
  @IsOptional()
  expense?: Expense;

  // @IsObject()
  // user: User;

  @IsString()
  userId: string;

  @IsNumber()
  @IsOptional() 
  expenseSplitAmount?: number;

  @IsNumber()
  @IsOptional() 
  expenseSplitPercentage?: number;
}