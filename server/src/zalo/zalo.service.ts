import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole, UserStatus, UserType } from 'src/user/user.enum';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ZaloService {
    constructor(private readonly userService: UserService) {

    }
    async me(code: string) {
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
            return user;
        }
        return user;
    }
}
