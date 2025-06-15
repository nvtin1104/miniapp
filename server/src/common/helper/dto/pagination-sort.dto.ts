import { Field, InputType, Int, registerEnumType } from "@nestjs/graphql";

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

registerEnumType(SortOrder, {
    name: 'SortOrder',
});
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