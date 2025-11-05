import { PrismaService } from '../prisma/prisma.service';
import { User } from './user';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(email: string, password: string, name?: string): Promise<User>;
    findByEmail(email: string): Promise<User | undefined>;
    findById(id: number): Promise<User | undefined>;
    validateUser(email: string, password: string): Promise<User | null>;
    sanitize(user: User): Omit<User, 'passwordHash'>;
}
