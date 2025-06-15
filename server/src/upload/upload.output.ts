import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadFileInfo {
  @Field(() => String, { nullable: true })
  alt?: string;

  @Field(() => String, { nullable: true })
  author?: string;

  @Field(() => String, { nullable: true })
  caption?: string;

  @Field(() => String, { nullable: true })
  copyright?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  field?: string;

  @Field(() => String, { nullable: true })
  filename?: string;

  @Field(() => [String], { nullable: true })
  keywords?: string[];

  @Field(() => String, { nullable: true })
  path?: string;

  @Field(() => Number, { nullable: true })
  size?: number;

  @Field(() => String, { nullable: true })
  table?: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  type?: string;
}
