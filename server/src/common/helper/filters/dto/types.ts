import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class StringFieldOperator {
  @Field(() => String, { nullable: true })
  eq?: string;

  @Field(() => String, { nullable: true })
  ne?: string;

  @Field(() => [String], { nullable: true })
  in?: string[];

  @Field(() => [String], { nullable: true })
  nin?: string[];

  @Field(() => String, { nullable: true })
  regex?: string;
}

@InputType()
export class IntFieldOperator {
  @Field(() => Number, { nullable: true })
  eq?: number;

  @Field(() => Number, { nullable: true })
  ne?: number;

  @Field(() => Number, { nullable: true })
  gt?: number;

  @Field(() => Number, { nullable: true })
  gte?: number;

  @Field(() => Number, { nullable: true })
  lt?: number;

  @Field(() => Number, { nullable: true })
  lte?: number;

  @Field(() => [Number], { nullable: true })
  in?: number[];

  @Field(() => [Number], { nullable: true })
  nin?: number[];
}

@InputType()
export class BooleanFieldOperator {
  @Field(() => Boolean, { nullable: true })
  eq?: boolean;

  @Field(() => Boolean, { nullable: true })
  ne?: boolean;
} 