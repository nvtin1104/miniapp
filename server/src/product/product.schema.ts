import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type ProductDocument = Product & Document;
@Schema({ timestamps: true, collection: 'products' })
export class Product {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop({ type: Types.ObjectId, ref: 'Category' })
    category: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Upload', required: false })
    image?: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);