import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GqlAuthGuard {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Token không được cung cấp');
    console.log('Authorization Header:', authHeader);
    const parts = authHeader.split(' ');
    console.log('Parts:', parts);

    let token;
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer' && parts[1]) {
      token = parts[1].trim();
    } else if (parts.length === 1 && parts[0]) {
      token = parts[0].trim();
    } else {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const decoded = this.jwtService.verify(token, { secret });
      req.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
