import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserGender, UserPermission, UserRole, UserStatus, UserType } from './user.enum';
import { ObjectPermission } from './entities/custom.entity';
import { Upload } from 'graphql-upload-ts';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true })
    name: string;
    @Prop({ required: true, unique: true })
    email: string;
    @Prop({ required: false })
    username?: string;
    @Prop({ required: false, minlength: 6, maxlength: 20 })
    phone: string;
    @Prop({ required: true, minlength: 6, maxlength: 20 })
    zaloId: string;
    @Prop({ required: true })
    password: string;
    @Prop({ default: Date.now })
    createdAt: Date;
    @Prop({ default: Date.now })
    updatedAt: Date;
    @Prop({ default: true })
    isActive: boolean;
    @Prop({
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    status: string;
    @Prop({
        enum: UserType,
        default: UserType.DEFAULT
    })
    type: string;
    @Prop({
        enum: UserRole,
        default: UserRole.USER
    })
    role: string;
    @Prop({ type: Types.ObjectId, ref: 'Upload', required: false })
    avatar?: Types.ObjectId | Upload;
    @Prop({ required: false })
    address?: string;
    @Prop({
        required: false,
        enum: UserGender,
        default: UserGender.UNKNOWN
    })
    gender?: string;
    @Prop({ default: Date.now })
    lastLoginAt: Date;
    @Prop({
        type: ObjectPermission,
        default: {
            name: 'guest',
            value: [UserPermission.GUEST]
        }
    })
    permissions: UserPermission[];
}

export const UserSchema = SchemaFactory.createForClass(User);

