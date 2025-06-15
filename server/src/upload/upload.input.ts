import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UploadFileInput {
    @Field(() => String, { nullable: true })
    path?: string;

    @Field(() => String, { nullable: true })
    alt?: string;

    @Field(() => String, { nullable: true })
    type?: string;

    @Field(() => String)
    table?: string;

    @Field(() => String)
    field?: string;

    @Field(() => Int, { nullable: true })
    size?: number;

    @Field(() => String, { nullable: true })
    filename?: string;

    // SEO fields
    @Field(() => String, { nullable: true })
    title?: string;

    @Field(() => String, { nullable: true })
    description?: string;

    @Field(() => [String], { nullable: true })
    keywords?: string[];

    @Field(() => String, { nullable: true })
    caption?: string;

    @Field(() => String, { nullable: true })
    author?: string;

    @Field(() => String, { nullable: true })
    copyright?: string;
}
