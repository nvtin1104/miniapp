import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus, UserType } from 'src/user/user.enum';
import { UserService } from 'src/user/user.service';
import { ZaloActiveInput } from './zalo.entity';

@Injectable()
export class ZaloService {
    constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {
    }
    async login(code: string) {
        const user = await this.userService.findBy({
            key: 'zaloId',
            value: code
        });
        if (!user) {
            const user = await this.userService.create({
                zaloId: code,
                type: UserType.ZALO,
                status: UserStatus.ACTIVE,
                role: UserRole.USER,
                name: 'Khách hàng mới',
                email: code + '@zalo.com',
                password: code,
                username: code,
                phone: code,
            });
            const accessToken = this.jwtService.sign({
                userId: (user as any)._id,
            });
            return {
                user,
                accessToken,
            };
        }
        return {
            user,
            accessToken: this.jwtService.sign({
                userId: (user as any)._id,
            }),
        };
    }
    async me(userId: string) {
        const user = await this.userService.findById(userId);
        return user;
    }
    async activeZalo(data: ZaloActiveInput) {
        const user = await this.userService.findBy({
            key: 'zaloId',
            value: data.id
        });
        console.log(user);
        if (!user) {
            throw new Error('User not found');
        }
        return []
    }
}
