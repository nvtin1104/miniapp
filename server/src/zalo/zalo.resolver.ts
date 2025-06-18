import { Args, Resolver, Query, Context, Mutation } from '@nestjs/graphql';
import { ZaloService } from './zalo.service';
import { ZaloMeResponse } from 'src/user/entities/custom.entity';
import { User } from 'src/user/entities/user.entity';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ZaloActiveInput } from './zalo.input';



@Resolver()
export class ZaloResolver {
    constructor(private readonly zaloService: ZaloService) { }
    @Query(() => ZaloMeResponse, { name: 'miniAppLogin' })
    async miniAppLogin(@Args('code') code: string) {
        return this.zaloService.login(code);
    }
    @UseGuards(GqlAuthGuard)
    @Query(() => User, { name: 'miniAppMe' })
    async miniAppMe(@Context() context) {
        const { userId } = context.req.user;
        return this.zaloService.me(userId);
    }
    @UseGuards(GqlAuthGuard)
    @Mutation(() => User, { name: 'miniAppActiveZalo' })
    async miniAppActiveZalo(@Args('data') data: ZaloActiveInput) {
        console.log(data);
        return this.zaloService.activeZalo(data);
    }
}
