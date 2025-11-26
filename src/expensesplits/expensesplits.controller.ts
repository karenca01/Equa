import { Controller, Get, Patch, Param, Delete, Body, UseGuards } from '@nestjs/common';
import { ExpensesplitsService } from './expensesplits.service';
import { UpdateExpensesplitDto } from './dto/update-expensesplit.dto';

@Controller('expensesplits')
export class ExpensesplitsController {
  constructor(private readonly expensesplitsService: ExpensesplitsService) {}

  @Get()
  findAll() {
    return this.expensesplitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesplitsService.findOne(id);
  }

  //encontrar por gasto
  @Get('/expense/:expenseId')
  async findByExpense(@Param('expenseId') expenseId: string) {
    // console.log(expenseId);
    const splits = await this.expensesplitsService.findByExpense(expenseId);
    return splits ?? [];
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateExpensesplitDto) {
    return this.expensesplitsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesplitsService.remove(id);
  }
}
