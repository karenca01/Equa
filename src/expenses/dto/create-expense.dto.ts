import { IsNotEmpty, IsNumber, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MaxLength(80)
  @IsNotEmpty()
  expenseDescription: string;

  @IsNumber()
  @IsNotEmpty()
  expenseAmount: number;

  @IsUUID()
  @IsNotEmpty()
  eventId: string; // el frontend lo enviará
}
