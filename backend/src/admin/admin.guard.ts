import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { secretsMatch } from '../common/secret';

@Injectable()
export class AdminTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const token = process.env.ADMIN_API_TOKEN;
    if (!token) throw new ServiceUnavailableException('Acesso administrativo não configurado.');
    const value = context.switchToHttp().getRequest().headers.authorization as string | undefined;
    const bearer = value?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!secretsMatch(bearer, token)) throw new UnauthorizedException('Credencial administrativa inválida.');
    return true;
  }
}
