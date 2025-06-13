import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserGender, UserPermission, UserRole, UserStatus, UserType } from './user.enum';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true })
    name: string;
    @Prop({ required: true, unique: true })
    email: string;
    @Prop({ required: false })
    username?: string;
    @Prop({ required: true, minlength: 6, maxlength: 20 })
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
    @Prop({ required: false })
    avatar?: string;
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
        type: [String],
        enum: UserPermission,
        default: [UserPermission.GUEST]
    })
    permissions: UserPermission[];
}

export const UserSchema = SchemaFactory.createForClass(User);

