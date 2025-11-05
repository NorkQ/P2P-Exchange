import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private jwtService;
    private usersService;
    constructor(jwtService: JwtService, usersService: UsersService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: Omit<User, "passwordHash">;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: Omit<User, "passwordHash">;
    }>;
    signToken(user: User): Promise<string>;
}
