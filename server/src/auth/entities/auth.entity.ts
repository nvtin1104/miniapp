import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserProfile {
  @Field()
  sub: string;

  @Field()
  iat: number;

  @Field()
  exp: number;
}
