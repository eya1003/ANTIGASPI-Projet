import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
    @Prop({ required: true })
    name: string;

    @Prop()
    barcode?: string;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    expiryDate: Date;

    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    user: User;

    @Prop({ default: '' })
    image?: string;

    @Prop({ default: '' })
    category?: string;

    @Prop({ default: false })
    savedFromWaste?: boolean; // pour calculer l’impact positif
}

export const ProductSchema = SchemaFactory.createForClass(Product);
