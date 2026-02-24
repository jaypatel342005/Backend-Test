import { IsEmail, IsNotEmpty, IsString, IsEnum, MinLength } from 'class-validator';

export enum Role {
  MANAGER = 'MANAGER',
  SUPPORT = 'SUPPORT',
  USER = 'USER',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}
