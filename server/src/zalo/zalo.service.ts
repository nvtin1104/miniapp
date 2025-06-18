import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus, UserType } from 'src/user/user.enum';
import { UserService } from 'src/user/user.service';
import { ZaloActiveInput } from './zalo.entity';
import { ZALO_CONFIG, ZaloUserInfo } from './zalo.config';
import axios from 'axios';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class ZaloService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly uploadService: UploadService
    ) {
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
    async getZaloUserInfo(userAccessToken: string, token: string, secretKey: string): Promise<ZaloUserInfo> {
        try {
            const response = await axios.get(ZALO_CONFIG.API_ENDPOINT, {
                headers: {
                    'access_token': userAccessToken,
                    'code': token,
                    'secret_key': secretKey,
                }
            });

            return response.data as ZaloUserInfo;
        } catch (error) {
            // console.error('Error calling Zalo API:', error.response?.data || error.message);
            throw new Error('Lỗi khi gọi API Zalo');
        }
    }
    async activeZalo(data: ZaloActiveInput) {
        const user = await this.userService.findBy({
            key: 'zaloId',
            value: data.id
        });

        if (!user) {
            throw new Error('User not found');
        }

        try {
            // Lấy secretKey từ environment variables
            const secretKey = this.configService.get<string>('ZALO_SECRET_KEY');
            if (!secretKey) {
                throw new Error('ZALO_SECRET_KEY chưa được cấu hình');
            }
            // Gọi API Zalo để lấy thông tin user
            const zaloUserInfo = await this.getZaloUserInfo(
                data.userAccessToken,
                data.token,
                secretKey
            );
            const upload = await this.uploadService.createUpload({
                path: data.avatar,
                type: 'images',
                field: 'avatar',
                table: 'users',
                filename: data.avatar,
            });

            // Cập nhật thông tin user với dữ liệu từ Zalo API
            const dataUpdate = {
                name: data.name,
                isZaloActive: true,
                avatar: upload._id,
            };
            if (zaloUserInfo?.data?.number) {
                dataUpdate['phone'] = zaloUserInfo?.data?.number;
            }

            const updatedUser = await this.userService.update((user as any)._id, dataUpdate as any);
            return updatedUser;
        } catch (error) {
            console.error('Error in activeZalo:', error);
            throw new Error('Failed to activate Zalo user');
        }
    }
}
