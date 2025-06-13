import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const createJwtConfig = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => ({
  secret: configService.get<string>('JWT_SECRET'),
  signOptions: { expiresIn: '1d' },
});
