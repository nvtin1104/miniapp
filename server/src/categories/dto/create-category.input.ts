import { InputType, Int, Field } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { UploadFileInput } from 'src/upload/upload.input';
import { Types } from 'mongoose';
import { UploadFileInfo } from 'src/upload/upload.output';

@InputType()
export class CreateCategoryInput {
    @Field(() => String)
    name: string;
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    description?: string;
    @Field(() => UploadFileInput, { nullable: true })
    @Prop({ type: Types.ObjectId, ref: 'Upload', required: false })
    @IsOptional()
    @IsString()
    image?: Types.ObjectId | UploadFileInfo;
    @Field(() => String)
    slug: string;
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    parentId?: string;

    @Field(() => Boolean, { 
        nullable: true,
        defaultValue: true
     })
    @IsOptional()
    @IsBoolean()
    status: boolean;

    @Field(() => Number, { nullable: true, defaultValue: 0 })
    @IsOptional()
    @IsNumber()
    level?: number;

    @Field(() => String, { nullable: true, defaultValue: 'product' })
    @IsOptional()
    @IsString()
    type?: string;
}
