import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(body: RegisterDto): Promise<{
        access_token: string;
        user: Omit<import("../users/user").User, "passwordHash">;
    }>;
    login(body: LoginDto): Promise<{
        access_token: string;
        user: Omit<import("../users/user").User, "passwordHash">;
    }>;
    me(req: any): {
        user: any;
    };
}
