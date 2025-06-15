import { Field } from "@nestjs/graphql";
import { InputType } from "@nestjs/graphql";
import { BooleanFieldOperator, IntFieldOperator, StringFieldOperator } from "./types";

@InputType()
export class UserFilterInput {
    @Field(() => StringFieldOperator, { nullable: true }) name?: StringFieldOperator;
    @Field(() => StringFieldOperator, { nullable: true }) email?: StringFieldOperator;
    @Field(() => IntFieldOperator, { nullable: true }) age?: IntFieldOperator;
    @Field(() => BooleanFieldOperator, { nullable: true }) isActive?: BooleanFieldOperator;
}
