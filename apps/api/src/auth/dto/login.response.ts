import { ObjectType, Field } from '@nestjs/graphql';
import { ProfileType } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

// Register ProfileType enum for GraphQL
registerEnumType(ProfileType, {
  name: 'ProfileType',
  description: 'User profile type in the system',
});

@ObjectType()
export class ProfileInfo {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => ProfileType)
  type: ProfileType;
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
