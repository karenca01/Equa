import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { Req, UseGuards } from '@nestjs/common';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createEventDto: CreateEventDto, @Req() req) {
    const user = req.user;
    console.log('Usuario autenticado:', user);

    return this.eventsService.create({
      ...createEventDto,
      createdBy: user.id,
    });
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post('add-participants/:id')
  async addParticipants(
    @Param('id') eventId: string,
    @Body('participants') participantIds: string[],
  ){
    return this.eventsService.addParticipants(eventId, participantIds);
  }

  @Delete(':eventId/participants') // Ruta más limpia y semántica
  async deleteParticipants(
    @Param('eventId') eventId: string, // Nombre del parámetro más claro
    @Body() body: { participants: string[] }, // Usamos el DTO o el cuerpo completo
  ) {
    return this.eventsService.deleteParticipants(eventId, body.participants);
  }

  @Get(':id/summary')
  async getEventSummary(@Param('id') id: string) {
    return this.eventsService.getEventSummary(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
