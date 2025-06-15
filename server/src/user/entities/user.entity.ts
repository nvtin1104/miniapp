// user.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ObjectPermission } from './custom.entity';

@ObjectType()
export class User {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  zaloId?: string;

  @Field({ nullable: true })
  password: string;
  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
  @Field()
  isActive: boolean;
  @Field({ nullable: true })
  status?: string;
  @Field({ nullable: true })
  type?: string;
  @Field({ nullable: true })
  role?: string;
  @Field({ nullable: true })
  avatar?: string;
  @Field({ nullable: true })
  address?: string;
  @Field({ nullable: true })
  gender?: string;
  @Field()
  lastLoginAt: Date;
  @Field(() => ObjectPermission, { nullable: true })
  permissions?: ObjectPermission;
}
