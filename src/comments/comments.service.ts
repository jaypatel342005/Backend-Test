import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

function fmtUser(u: any) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.roles ? { id: u.roles.id, name: u.roles.name } : null,
    created_at: u.created_at,
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

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  private async getComment(id: number) {
    const comment = await this.prisma.ticket_comments.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async updateComment(id: number, userId: number, role: string, dto: UpdateCommentDto) {
    const comment = await this.getComment(id);

    if (role !== 'MANAGER' && comment.user_id !== userId) {
      throw new ForbiddenException('you  edit your   comments');
    }

    const updated = await this.prisma.ticket_comments.update({
      where: { id },
      data: { comment: dto.comment },
      include: {
        users: { include: { roles: true } },
      },
    });

    return fmtComment(updated);
  }

  async deleteComment(id: number, userId: number, role: string) {
    const comment = await this.getComment(id);

    if (role !== 'MANAGER' && comment.user_id !== userId) {
      throw new ForbiddenException('you only delete comments');
    }

    await this.prisma.ticket_comments.delete({ where: { id } });
    return { message: 'Comment deleted' };
  }
}
