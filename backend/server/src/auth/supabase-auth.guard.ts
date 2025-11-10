import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }
    const token = auth.slice(7);
    const client = this.supabase.getClient();
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) {
      throw new UnauthorizedException('Invalid Supabase token');
    }
    const user = data.user;
    const role = (user.user_metadata?.role || user.app_metadata?.role || 'USER') as
      | 'USER'
      | 'ADMIN'
      | 'API';
    req.user = {
      id: user.id,
      email: user.email,
      role,
    };
    return true;
  }
}