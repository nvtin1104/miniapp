import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';
import { IsDate, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => ID)
  _id: string;
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  lastLoginAt?: Date;
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
