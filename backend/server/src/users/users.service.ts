import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './user';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, password: string, name?: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, name, passwordHash },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return undefined;
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    };
  }

  async findById(id: number): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return undefined;
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    };
  }

  sanitize(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}