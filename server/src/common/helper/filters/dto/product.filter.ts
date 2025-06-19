import { Field } from "@nestjs/graphql";
import { InputType } from "@nestjs/graphql";
import { BooleanFieldOperator, IntFieldOperator, StringFieldOperator } from "./types";

@InputType()
export class ProductFilterInput {
    @Field(() => StringFieldOperator, { nullable: true }) name?: StringFieldOperator;
    @Field(() => StringFieldOperator, { nullable: true }) description?: StringFieldOperator;
    @Field(() => IntFieldOperator, { nullable: true }) price?: IntFieldOperator;
    @Field(() => BooleanFieldOperator, { nullable: true }) status?: BooleanFieldOperator;
}
