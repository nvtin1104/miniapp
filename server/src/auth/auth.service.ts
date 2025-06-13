import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createBcryptHook } from 'src/common/hook/hash-password.hook';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const { comparePassword } = createBcryptHook(this.configService);

        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Không tìm thấy người dùng với email này');
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Mật khẩu không chính xác');
        }

        return user;
    }

    async login(email: string, password: string): Promise<{ accessToken: string }> {
        const user = await this.validateUser(email, password);
        const payload = {
             username: user.username,
              userId: user._id,
              role: user.role, 
              permissions: user.permissions,
            };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}
