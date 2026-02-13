import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(data: RegisterDto): Promise<{ user: AuthUser }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    if (typeof data.password !== 'string') {
      throw new BadRequestException('Invalid password format');
    }

    if (!data.password || typeof data.password !== 'string') {
      throw new BadRequestException('Invalid password format');
    }

    let passwordHash: string;
    try {
      passwordHash = await (
        bcrypt as { hash: (s: string, r: number) => Promise<string> }
      ).hash(data.password, 10);
    } catch {
      throw new BadRequestException('Failed to process password');
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return { user };
  }

  /**
   * Login user and issue JWT
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || typeof user.passwordHash !== 'string') {
      throw new UnauthorizedException('Invalid credentials');
    }

    let passwordValid: boolean;
    try {
      passwordValid = await (
        bcrypt as { compare: (data: string, hash: string) => Promise<boolean> }
      ).compare(data.password, user.passwordHash);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   /**
    * Logout (stateless JWT)
    */
  async logout(): Promise<{ success: boolean }> {
    // JWT logout is handled client-side.
    // This method exists for API consistency and future token blacklisting.
    await Promise.resolve(); // Ensures at least one await expression for linting
    return { success: true };
  }
}
