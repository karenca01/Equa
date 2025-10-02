import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpensesplitsService } from './expensesplits.service';
import { CreateExpensesplitDto } from './dto/create-expensesplit.dto';
import { UpdateExpensesplitDto } from './dto/update-expensesplit.dto';

@Controller('expensesplits')
export class ExpensesplitsController {
  constructor(private readonly expensesplitsService: ExpensesplitsService) {}

  @Post()
  create(@Body() createExpensesplitDto: CreateExpensesplitDto) {
    return this.expensesplitsService.create(createExpensesplitDto);
  }

  @Get()
  findAll() {
    return this.expensesplitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesplitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpensesplitDto: UpdateExpensesplitDto) {
    return this.expensesplitsService.update(id, updateExpensesplitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesplitsService.remove(id);
  }
}
