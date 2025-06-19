import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { Upload } from 'graphql-upload-ts';

export type CategoriesDocument = Categories & Document;

@ObjectType()
@Schema({ collection: 'categories' })
export class Categories {
    @Field(() => String)
    @Prop()
    name: string;

    @Field(() => String, { nullable: true })
    @Prop()
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'Upload', required: false })
    image?: Types.ObjectId | Upload;

    @Field(() => String)
    @Prop()
    slug: string;

    @Field(() => String, { nullable: true })
    @Prop()
    parentId?: string;

    @Field(() => Boolean)
    @Prop({ default: true })
    status: boolean;

    @Field(() => Number)
    @Prop({ default: 0 })
    level: number;

    @Field(() => String)
    @Prop({
        enum: [
            'post',
            'product',
        ],
        default: 'product'
    })
    type: string;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const CategoriesSchema = SchemaFactory.createForClass(Categories);
