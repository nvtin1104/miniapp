// create-user.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ObjectPermissionInput } from './custom.input';
import { Prop } from '@nestjs/mongoose';
import { UploadFileInfo } from 'src/upload/upload.output';
import { Types } from 'mongoose';
import { UploadFileInput } from 'src/upload/upload.input';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  zaloId?: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  type?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  role?: string;

  @Field(() => UploadFileInput, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Upload', required: false })
  @IsOptional()
  @IsString()
  avatar?: Types.ObjectId | UploadFileInfo;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  gender?: string;

  @Field({ nullable: true })
  @IsOptional()
  lastLoginAt?: Date;

  @Field(() => ObjectPermissionInput, { nullable: true })
  @IsOptional()
  permissions?: ObjectPermissionInput;
}
