import { Args, Resolver, Query } from '@nestjs/graphql';
import { ZaloService } from './zalo.service';
import { User } from 'src/user/entities/user.entity';

@Resolver()
export class ZaloResolver {
    constructor(private readonly zaloService: ZaloService) { }
    @Query(() => User, { name: 'zaloMe' })
    async me(@Args('code') code: string) {
        return this.zaloService.me(code);
    }
}
