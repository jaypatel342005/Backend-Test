import { IsEnum } from 'class-validator';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  status: TicketStatus
}
