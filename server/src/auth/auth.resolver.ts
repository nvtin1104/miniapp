import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
  ) { }
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
    @Context() context: { res: Response & { cookie: Function } },
  ): Promise<string> {
    const { accessToken, refreshToken } = await this.authService.login(email, password);

    context.res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    context.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return accessToken;
  }
}
