import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }
  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  getProfile(@Context() context) {
    const {
      username,
    } = context.req.user;
    if (!username) {
      throw new Error('Unauthorized');
    }
    return username;
  }
  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    const token = await this.authService.login(email, password);
    return token.accessToken;
  }
}
