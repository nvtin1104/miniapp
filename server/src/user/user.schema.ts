import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);