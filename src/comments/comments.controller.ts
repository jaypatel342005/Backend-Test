import { Controller, Patch, Delete, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Patch(':id')
  editComment(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(id, req.user.userId, req.user.role, dto);
  }

  @Delete(':id')
  removeComment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.commentsService.deleteComment(id, req.user.userId, req.user.role);
  }
}
