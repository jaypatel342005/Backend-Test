import {
  Controller,Post,Get,
  Patch,
  Delete,Body,Param,Query,Request,UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  @Roles('MANAGER', 'USER')
  create(@Request() req, @Body() dto: CreateTicketDto) {
    return this.ticketsService.createTicket(req.user.userId, dto);
  }

  @Get()
  @Roles('MANAGER', 'SUPPORT', 'USER')
  getAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: any,
    @Query('priority') priority?: any,
  ) {
    return this.ticketsService.getTickets(
      req.user.userId,
      req.user.role,
      page ? +page : 1,
      limit ? +limit : 10,
      status,
      priority,
    );
  }

  @Patch(':id/assign')
  @Roles('MANAGER', 'SUPPORT')
  assign(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignTicketDto) {
    return this.ticketsService.assignTicket(id, dto);
  }

  @Patch(':id/status')
  @Roles('MANAGER', 'SUPPORT')
  changeStatus(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateStatus(id, req.user.userId, dto);
  }

  @Delete(':id')
  @Roles('MANAGER')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.deleteTicket(id)
  }

  @Post(':id/comments')
  @Roles('MANAGER', 'SUPPORT', 'USER')
  postComment(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.ticketsService.addComment(id, req.user.userId, req.user.role, dto);
  }

  @Get(':id/comments')
  @Roles('MANAGER', 'SUPPORT', 'USER')
  listComments(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.getComments(id, req.user.userId, req.user.role);
  }
}
