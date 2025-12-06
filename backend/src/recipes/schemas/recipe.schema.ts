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
    instructions?: string; // étapes de la recette

    @Prop()
    image?: string;

    @Prop()
    category?: string; // ex: Dessert

    @Prop()
    area?: string; // ex: Malaysian

    @Prop([String])
    tags?: string[];

    @Prop([String])
    ingredientList?: string[]; // strIngredientX

    @Prop([String])
    measuresList?: string[]; // strMeasureX

    @Prop({ type: Types.ObjectId, ref: 'User' })
    user?: User;

    @Prop()
    sourceUrl?: string;

    @Prop()
    youtubeUrl?: string;
}
export const RecipeSchema = SchemaFactory.createForClass(Recipe);
