import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

function fmtUser(u: any) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.roles ? { id: u.roles.id, name: u.roles.name } : null,
    created_at: u.created_at,
  }
}

function fmtTicket(t: any) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    created_by: fmtUser(t.users_tickets_created_byTousers),
    assigned_to: fmtUser(t.users_tickets_assigned_toTousers),
    created_at: t.created_at,
  };
}

function fmtComment(c: any) {
  return {
    id: c.id,
    comment: c.comment,
    user: fmtUser(c.users),
    created_at: c.created_at,
  };
}

const TICKET_INCLUDE = {
  users_tickets_created_byTousers: { include: { roles: true } },
  users_tickets_assigned_toTousers: { include: { roles: true } },
};

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async createTicket(userId: number, dto: CreateTicketDto) {
    const raw = await this.prisma.tickets.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        created_by: userId,
        status: 'OPEN',
      },
      include: TICKET_INCLUDE,
    });

    return fmtTicket(raw);
  }

  async getTickets(
    userId: number,
    role: string,
    page = 1,
    limit = 10,
    status?: TicketStatus,
    priority?: 'LOW' | 'MEDIUM' | 'HIGH',
  ) {
    const where: any = {};

    if (role === 'USER') where.created_by = userId;
    if (role === 'SUPPORT') where.assigned_to = userId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const skip = (page - 1) * limit;

    const tickets = await this.prisma.tickets.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: TICKET_INCLUDE,
    });

    return tickets.map(fmtTicket);
  }

  async findOne(id: number) {
    const ticket = await this.prisma.tickets.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('ticket not found')
    return ticket;
  }

  async assignTicket(id: number, dto: AssignTicketDto) {
    await this.findOne(id);

    const assignee = await this.prisma.users.findUnique({
      where: { id: dto.userId },
      include: { roles: true },
    });

    if (!assignee) throw new NotFoundException('User not found')
    if (assignee.roles.name === 'USER') {
      throw new BadRequestException('cannot assign ticket')
    }

    const updated = await this.prisma.tickets.update({
      where: { id },
      data: { assigned_to: dto.userId },
      include: TICKET_INCLUDE,
    });

    return fmtTicket(updated);
  }

  async updateStatus(id: number, userId: number, dto: UpdateTicketStatusDto) {
    const ticket = await this.findOne(id);

    const flow: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const currentIdx = flow.indexOf(ticket.status as TicketStatus);
    const nextIdx = flow.indexOf(dto.status as TicketStatus);

    if (nextIdx !== currentIdx + 1) {
      throw new BadRequestException(
      
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.tickets.update({
        where: { id },
        data: { status: dto.status as TicketStatus },
        include: TICKET_INCLUDE,
      });

      await tx.ticket_status_logs.create({
        data: {
          ticket_id: id,
          old_status: ticket.status as any,
          new_status: dto.status as any,
          changed_by: userId,
        },
      });

      return fmtTicket(updated);
    });
  }

  async deleteTicket(id: number) {
    await this.findOne(id);
    await this.prisma.tickets.delete({ where: { id } });
    return { message: 'Ticket deleted' };
  }

  private async checkTicketAccess(ticketId: number, userId: number, role: string) {
    const ticket = await this.findOne(ticketId);
    if (role === 'MANAGER') return ticket;
    if (role === 'SUPPORT' && ticket.assigned_to === userId) return ticket;
    if (role === 'USER' && ticket.created_by === userId) return ticket;
    throw new ForbiddenException('Access denied');
  }

  async addComment(ticketId: number, userId: number, role: string, dto: CreateCommentDto) {
    await this.checkTicketAccess(ticketId, userId, role);

    const raw = await this.prisma.ticket_comments.create({
      data: {
        ticket_id: ticketId,
        user_id: userId,
        comment: dto.comment,
      },
      include: {
        users: { include: { roles: true } },
      },
    });

    return fmtComment(raw);
  }

  async getComments(ticketId: number, userId: number, role: string) {
    await this.checkTicketAccess(ticketId, userId, role);

    const rows = await this.prisma.ticket_comments.findMany({
      where: { ticket_id: ticketId },
      orderBy: { created_at: 'asc' },
      include: {
        users: { include: { roles: true } },
      },
    });

    return rows.map(fmtComment);
  }
}
