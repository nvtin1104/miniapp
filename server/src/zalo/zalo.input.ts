import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class ZaloActiveInput {
    @Field()
    avatar: string;
    @Field()
    id: string;
    @Field()
    name: string;
    @Field()
    token: string;
}