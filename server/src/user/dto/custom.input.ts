import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';


@InputType()
export class ObjectPermissionInput {
  @Field(() => String)
  name: string;
  @Field(() => [String])
  value: Array<string>;
}