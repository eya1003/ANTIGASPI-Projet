import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';
import { User } from '../../users/schemas/user.schema';

export type RecipeDocument = Recipe & Document;

@Schema()
export class Recipe {
    @Prop({ required: true })
    title: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
    ingredients: Product[];

    @Prop()
    instructions?: string;

    @Prop()
    image?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    user?: User;

    @Prop()
    sourceUrl?: string; // url OpenFoodFacts
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
