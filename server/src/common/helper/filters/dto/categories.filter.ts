import { Field } from "@nestjs/graphql";
import { InputType } from "@nestjs/graphql";
import { BooleanFieldOperator, IntFieldOperator, StringFieldOperator } from "./types";

@InputType()
export class CategoriesFilterInput {
    @Field(() => StringFieldOperator, { nullable: true }) name?: StringFieldOperator;
    @Field(() => StringFieldOperator, { nullable: true }) description?: StringFieldOperator;
    @Field(() => StringFieldOperator, { nullable: true }) image?: StringFieldOperator;
    @Field(() => StringFieldOperator, { nullable: true }) slug?: StringFieldOperator;
    @Field(() => StringFieldOperator, { nullable: true }) parentId?: StringFieldOperator;
    @Field(() => BooleanFieldOperator, { nullable: true }) status?: BooleanFieldOperator;
    @Field(() => IntFieldOperator, { nullable: true }) level?: IntFieldOperator;
    @Field(() => StringFieldOperator, { nullable: true }) createdAt?: StringFieldOperator;
    @Field(() => StringFieldOperator, { nullable: true }) updatedAt?: StringFieldOperator;
}
