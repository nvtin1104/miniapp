import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

export type UploadDocument = Upload & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Upload {
  @Field(() => ID)
  _id: string;

  @Prop()
  @Field(() => String, { nullable: true })
  path?: string;

  @Prop()
  @Field(() => String, { nullable: true })
  alt?: string;

  @Prop()
  @Field(() => String, { nullable: true })
  table?: string;

  @Prop()
  @Field(() => String, { nullable: true })
  type?: string;

  @Prop()
  @Field(() => String, { nullable: true })
  field?: string;

  @Prop()
  @Field(() => Int, { nullable: true })
  size?: number;

  @Prop()
  @Field(() => String, { nullable: true })
  filename?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Prop()
  @Field(() => String, { nullable: true })
  title?: string;

  @Prop()
  @Field(() => String, { nullable: true })
  description?: string;

  @Prop([String])
  @Field(() => [String], { nullable: true })
  keywords?: string[];

  @Prop()
  @Field(() => String, { nullable: true })
  caption?: string;

  @Prop()
  @Field(() => String, { nullable: true })
  author?: string;

  @Prop()
  @Field(() => String, { nullable: true })
  copyright?: string;
}

export const UploadSchema = SchemaFactory.createForClass(Upload);
