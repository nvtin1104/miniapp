import { ArgsType, Field, ID } from '@nestjs/graphql';

@ArgsType()
export class DeleteUserArgs {
  @Field(() => ID)
  id: string;
}
