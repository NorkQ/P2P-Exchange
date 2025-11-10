"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let SupabaseAuthGuard = class SupabaseAuthGuard {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const auth = req.headers['authorization'];
        if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
            throw new common_1.UnauthorizedException('Missing Bearer token');
        }
        const token = auth.slice(7);
        const client = this.supabase.getClient();
        const { data, error } = await client.auth.getUser(token);
        if (error || !data?.user) {
            throw new common_1.UnauthorizedException('Invalid Supabase token');
        }
        const user = data.user;
        const role = (user.user_metadata?.role || user.app_metadata?.role || 'USER');
        req.user = {
            id: user.id,
            email: user.email,
            role,
        };
        return true;
    }
};
exports.SupabaseAuthGuard = SupabaseAuthGuard;
exports.SupabaseAuthGuard = SupabaseAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SupabaseAuthGuard);
//# sourceMappingURL=supabase-auth.guard.js.map