import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.getUserByEmail(loginDto.email)

    if (!user) {
      throw new UnauthorizedException('invalid email or password')
    }

    const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.roles?.name,
    };

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
