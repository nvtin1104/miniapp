import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
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