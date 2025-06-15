import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

@InputType()
export class FilterFieldInput {
  @Field({ nullable: true }) eqString?: string;
  @Field(() => Int, { nullable: true }) eqInt?: number;
  @Field({ nullable: true }) eqBoolean?: boolean;

  @Field({ nullable: true }) neString?: string;
  @Field(() => Int, { nullable: true }) neInt?: number;
  @Field({ nullable: true }) neBoolean?: boolean;

  @Field(() => Int, { nullable: true }) gt?: number;
  @Field(() => Int, { nullable: true }) gte?: number;
  @Field(() => Int, { nullable: true }) lt?: number;
  @Field(() => Int, { nullable: true }) lte?: number;

  @Field(() => [String], { nullable: true }) inStrings?: string[];
  @Field(() => [Int], { nullable: true }) inInts?: number[];
  @Field(() => [String], { nullable: true }) ninStrings?: string[];
  @Field(() => [Int], { nullable: true }) ninInts?: number[];

  @Field({ nullable: true }) regex?: string;
}


@InputType()
export class FilterInput {
  @Field(() => [String])
  fields: string[];

  @Field(() => [FilterFieldInput])
  conditions: FilterFieldInput[];
}

@InputType()
export class SortInput {
  @Field()
  field: string;

  @Field(() => SortOrder)
  order: SortOrder;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  limit: number = 10;
}
@InputType()
export class ObjectPermissionInput {
  @Field(() => String)
  name: string;
  @Field(() => [String])
  value: Array<string>;
}