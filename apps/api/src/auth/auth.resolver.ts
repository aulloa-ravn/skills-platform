import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { LoginResponse } from './dto/login.response';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { RefreshTokenResponse } from './dto/refresh-token.response';
import { Public } from './decorators/public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Public()
  @Query(() => String)
  health(): string {
    return 'OK';
  }

  @Public()
  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
    return this.authService.login(input.email, input.password);
  }

  @Public()
  @Mutation(() => RefreshTokenResponse)
  async refreshToken(
    @Args('input') input: RefreshTokenInput,
  ): Promise<RefreshTokenResponse> {
    const accessToken = await this.authService.refreshAccessToken(
      input.refreshToken,
    );
    return { accessToken };
  }
}
