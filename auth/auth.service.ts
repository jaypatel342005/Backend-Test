import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    /**
     * 1. Check email already exists? (v)
     * 2. Hash the password (v)
     * 3. Create user (v)
     * 4. Generate JWT token (v)
     * 5. Return the token (v)
     */

    const user = await this.userService.getUserByEmail(registerDto.email);
    if (user) {
      throw new ConflictException('Email already taken!');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const newUser = await this.userService.createUser({
      ...registerDto,
      password: hashedPassword,
    });
    this.logger.log(`New user has been created: ${newUser.id}`);

    const payload = { sub: newUser.id, email: newUser.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async login(loginDto: LoginDto) {
    /**
     * 1. Get the user from db (v)
     * 2. Match the password with hashed password (v)
     * 3. Create JWT token (v)
     * 4. Return JWT token (v)
     */

    const user = await this.userService.getUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect!');
    }

    const match = await bcrypt.compare(loginDto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Email or password is incorrect!');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
