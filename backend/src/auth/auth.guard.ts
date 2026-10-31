import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHmac, timingSafeEqual } from 'crypto';
import { IS_PUBLIC } from './auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])) return true;
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const secret = process.env.AUTH_SECRET;
    if (!token || !secret || secret.length < 32) throw new UnauthorizedException('Authentication required');
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) throw new UnauthorizedException('Invalid session');
    const expected = createHmac('sha256', secret).update(encoded).digest('base64url');
    const a = Buffer.from(signature); const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException('Invalid session');
    try {
      const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
      if (payload.exp <= Date.now() || payload.role !== 'MAIN_ADMIN') throw new Error();
      req.user = payload;
    } catch { throw new UnauthorizedException('Session expired'); }
    return true;
  }
}
