import { Controller, Post, Body, UseGuards, Req, Get, Param, Patch, Delete } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Ajusta la ruta según tu estructura

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // @UseGuards(JwtAuthGuard)
  @Auth()
  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @Req() req) {
    const userId = req.user.sub; // el userId del token
    return this.expensesService.create(createExpenseDto, userId);
  }

  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @Get('/event/:eventId')
  async findByEvent(@Param('eventId') eventId: string) {
    const expenses = await this.expensesService.findByEvent(eventId);
    return expenses ?? [];
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
