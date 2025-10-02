import { PartialType } from '@nestjs/mapped-types';
import { CreateExpensesplitDto } from './create-expensesplit.dto';

export class UpdateExpensesplitDto extends PartialType(CreateExpensesplitDto) {}
