import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

// shape every user response the same way as the spec:
// { id, name, email, role: { id, name }, created_at }
function formatUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.roles ? { id: u.roles.id, name: u.roles.name } : null,
    created_at: u.created_at,
  };
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserByEmail(email: string) {
    return this.prisma.users.findFirst({
      where: { email },
      include: { roles: true },
    });
  }

  async createUser(dto: CreateUserDto) {
    const role = await this.prisma.roles.findUnique({ where: { name: dto.role } });
    if (!role) {
      throw new BadRequestException('Role  not found');
    }

    const existing = await this.prisma.users.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('email  already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role_id: role.id,
      },
      include: { roles: true },
    });

    return formatUser(user);
  }

  async getAllUsers() {
    const users = await this.prisma.users.findMany({
      include: { roles: true },
    });
    return users.map(formatUser);
  }
}
