import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema()
export class Recipe {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop()
  instructions: string;

  @Prop()
  image?: string;

  @Prop({ default: 0 })
  score?: number;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
