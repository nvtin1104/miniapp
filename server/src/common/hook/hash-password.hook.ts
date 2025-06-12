import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

/**
 * Factory tạo hook với config động từ env
 * @param configService instance của ConfigService
 */
export const createBcryptHook = (configService: ConfigService) => {
  const secretKey = configService.get<string>('BCRYPT_SECRET_KEY') || 'default_key';

  const saltRounds = 10; // Có thể cố định hoặc cũng từ env

  const hashPassword = async (password: string): Promise<string> => {
    // Kết hợp thêm secretKey (nếu muốn)
    const saltedPassword = password + secretKey;
    return bcrypt.hash(saltedPassword, saltRounds);
  };

  const comparePassword = async (
    password: string,
    hashedPassword: string,
  ): Promise<boolean> => {
    const saltedPassword = password + secretKey;
    return bcrypt.compare(saltedPassword, hashedPassword);
  };

  return { hashPassword, comparePassword };
};
