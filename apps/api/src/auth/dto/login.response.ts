import { ObjectType, Field } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

// Register Role enum for GraphQL
registerEnumType(Role, {
  name: 'Role',
  description: 'User role in the system',
});

@ObjectType()
export class ProfileInfo {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Role)
  role: Role;
}

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => ProfileInfo)
  profile: ProfileInfo;
}
