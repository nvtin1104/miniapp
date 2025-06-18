import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
export class UserListResponse {
  @Field(() => [User])
  data: User[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
@ObjectType()
export class ObjectPermission {
  @Field(() => String)
  name: string;
  @Field(() => [String])
  value: Array<string>;
}
@ObjectType()
export class ZaloMeResponse {
  @Field(() => User)
  user: User;

  @Field()
  accessToken: string;
}