import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  username?: string;

  @Field()
  phone: string;

  @Field()
  zaloId: string;

  @Field()
  password: string;
}
