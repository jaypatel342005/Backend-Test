import { IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class CreateTicketDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsEnum(TicketPriority)
  priority: TicketPriority
}
