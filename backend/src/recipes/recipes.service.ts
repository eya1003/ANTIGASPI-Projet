import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Recipe, RecipeDocument } from './schemas/recipe.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import axios from 'axios';

@Injectable()
export class RecipesService {
    constructor(
        @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    async addRecipe(recipeData: Partial<Recipe>): Promise<Recipe> {
        const recipe = new this.recipeModel(recipeData);
        return recipe.save();
    }

    async findAll(): Promise<Recipe[]> {
        return this.recipeModel.find().populate('ingredients').exec();
    }

    async findOne(id: string): Promise<Recipe> {
        const recipe = await this.recipeModel.findById(id).populate('ingredients').exec();
        if (!recipe) throw new NotFoundException('Recipe not found');
        return recipe;
    }

    async delete(id: string): Promise<{ message: string }> {
        const deleted = await this.recipeModel.findByIdAndDelete(id).exec();
        if (!deleted) throw new NotFoundException('Recipe not found');
        return { message: 'Recipe deleted successfully' };
    }

    async recommendRecipes(userId: string): Promise<Recipe[]> {
        // Récupérer les produits de l'utilisateur
        const userProducts = await this.productModel.find({ user: userId }).exec();
        const productNames = userProducts.map(p => p.name.toLowerCase());

        // Récupérer toutes les recettes existantes avec les ingrédients
        const allRecipes = await this.recipeModel.find().populate('ingredients').exec();

        // Filtrer les recettes où tous les ingrédients sont disponibles dans le frigo
        const recommended = allRecipes.filter(recipe => {
            const ingredientNames = (recipe.ingredients as Product[]).map(ing => ing.name.toLowerCase());
            // Vérifie que chaque ingrédient de la recette est dans le frigo
            return ingredientNames.every(name => productNames.includes(name));
        });

        return recommended;
    }

    // Recommandations à partir des produits du frigo via TheMealDB
    async recommendRecipesMeal(userId: string): Promise<any[]> {
        // 1️⃣ Récupérer les produits de l'utilisateur
        const userProducts = await this.productModel.find({ user: userId }).exec();
        const productNames = userProducts.map(p => p.name.toLowerCase());

        const recipeResults: any[] = [];

        // 2️⃣ Pour chaque ingrédient, récupérer les plats correspondants
        for (const ingredient of productNames) {
            const filterUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
            try {
                const filterResponse = await axios.get(filterUrl);
                const meals = filterResponse.data.meals || [];

                for (const meal of meals) {
                    // 3️⃣ Pour chaque plat, récupérer les détails complets
                    const lookupUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`;
                    const lookupResponse = await axios.get(lookupUrl);
                    const fullMeal = lookupResponse.data.meals?.[0];
                    if (!fullMeal) continue;

                    // 4️⃣ Vérifier si la recette contient au moins un produit du frigo
                    const ingredients: string[] = [];
                    for (let i = 1; i <= 20; i++) {
                        const ing = fullMeal[`strIngredient${i}`];
                        if (ing) ingredients.push(ing.toLowerCase());
                    }

                    if (ingredients.some(ing => productNames.includes(ing))) {
                        recipeResults.push(fullMeal);
                    }
                }
            } catch (err) {
                console.error(`Erreur pour l'ingrédient ${ingredient}:`, err.message);
            }
        }

        // 5️⃣ Supprimer les doublons
        const uniqueRecipes = Array.from(
            new Map(recipeResults.map(item => [item.idMeal, item])).values()
        );

        return uniqueRecipes;
    }
}