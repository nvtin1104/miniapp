import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UploadFileInfo } from 'src/upload/upload.output';
import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@ObjectType()
export class Category {
  @Field(() => String)
  _id: string;
  @Field(() => String)
  name: string;
  @Field(() => String, { nullable: true })
  description?: string;
  @Field(() => String, { nullable: true })
  slug?: string;
  @Field(() => UploadFileInfo, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Upload', required: false })
  image?: Types.ObjectId | UploadFileInfo;
  @Field(() => String)
  parentId: string;
  @Field(() => Boolean)
  status: boolean;
  @Field(() => Number)
  level: number;
  @Field(() => Date)
  createdAt: Date;
  @Field(() => Date)
  updatedAt: Date;
}
