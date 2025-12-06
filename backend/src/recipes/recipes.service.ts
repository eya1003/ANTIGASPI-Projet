import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recipe, RecipeDocument } from './schemas/recipe.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import axios from 'axios';

import {
    ImportedRecipeResult,
    RecipeWithMissing,
    RecipePerProduct,
} from './types/recipe.types';

@Injectable()
export class RecipesService {
    constructor(
        @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    // ---------------------------------------------------
    // 1. CRUD de base
    // ---------------------------------------------------

    async addRecipe(recipeData: Partial<Recipe>): Promise<Recipe> {
        const recipe = new this.recipeModel(recipeData);
        return recipe.save();
    }

    async findAll(): Promise<Recipe[]> {
        return this.recipeModel.find().populate('ingredients').exec();
    }

    async findOne(id: string): Promise<Recipe> {
        const recipe = await this.recipeModel.findById(id).populate('ingredients');
        if (!recipe) throw new NotFoundException('Recipe not found');
        return recipe;
    }

    async delete(id: string): Promise<{ message: string }> {
        const deleted = await this.recipeModel.findByIdAndDelete(id);
        if (!deleted) throw new NotFoundException('Recipe not found');
        return { message: 'Recipe deleted successfully' };
    }

    // ---------------------------------------------------
    // 2. RECOMMANDATIONS LOCALES
    // ---------------------------------------------------

    async recommendRecipes(userId: string): Promise<Recipe[]> {
        const userProducts = await this.productModel.find({ user: userId });
        const productNames = userProducts.map(p => p.name.toLowerCase());

        const allRecipes = await this.recipeModel.find().populate('ingredients');

        const recommended = allRecipes.filter(recipe => {
            const ingredientNames = (recipe.ingredients as Product[])
                .map(ing => ing.name.toLowerCase());

            return ingredientNames.every(name => productNames.includes(name));
        });

        return recommended;
    }

    // ---------------------------------------------------
    // 3. RECOMMANDATIONS VIA API MEALDB
    // ---------------------------------------------------

    async recommendRecipesMeal(userId: string): Promise<any[]> {
        const userProducts = await this.productModel.find({ user: userId });
        const productNames = userProducts.map(p => p.name.toLowerCase());

        const results: any[] = [];
        const uniqueIds = new Set<string>();

        for (const ingredient of productNames) {
            try {
                const filterRes = await axios.get(
                    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
                );

                const meals = filterRes.data.meals || [];

                for (const meal of meals) {
                    if (uniqueIds.has(meal.idMeal)) continue;

                    const details = await axios.get(
                        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                    );

                    const fullMeal = details.data.meals?.[0];
                    if (!fullMeal) continue;

                    // Vérifier si au moins 1 ingrédient correspond
                    const ingredients: string[] = [];

                    for (let i = 1; i <= 20; i++) {
                        const ing = fullMeal[`strIngredient${i}`];
                        if (ing) ingredients.push(ing.toLowerCase());
                    }

                    if (ingredients.some(ing => productNames.includes(ing))) {
                        uniqueIds.add(meal.idMeal);
                        results.push(fullMeal);
                    }
                }
            } catch (err) {
                console.error("Erreur MealDB:", err.message);
            }
        }

        return results;
    }

    // ---------------------------------------------------
    // 4. IMPORT AUTOMATIQUE : 1 RECETTE PAR PRODUIT
    // ---------------------------------------------------

    async importOneRecipePerProduct(userId: string) {
        const userProducts = await this.productModel.find({ user: userId });

        if (userProducts.length === 0) {
            return { message: "Aucun produit trouvé.", data: [] };
        }

        const importedRecipes: ImportedRecipeResult[] = [];

        const uniqueNames = Array.from(
            new Set(userProducts.map(p => p.name.toLowerCase().trim()))
        );

        for (const product of uniqueNames) {
            try {
                const filterRes = await axios.get(
                    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${product}`
                );

                const meals = filterRes.data.meals;

                if (!meals?.length) {
                    importedRecipes.push({
                        product,
                        recipe: null,
                        message: "Aucune recette trouvée"
                    });
                    continue;
                }

                const randomMeal = meals[Math.floor(Math.random() * meals.length)];
                const lookup = await axios.get(
                    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${randomMeal.idMeal}`
                );

                const full = lookup.data.meals[0];

                // Extraire ingrédients
                const ingredientList: string[] = [];
                const measuresList: string[] = [];

                for (let i = 1; i <= 20; i++) {
                    const ing = full[`strIngredient${i}`];
                    const measure = full[`strMeasure${i}`];
                    if (ing && ing.trim() !== "") {
                        ingredientList.push(ing);
                        measuresList.push(measure);
                    }
                }

                // Produits internes correspondants
                const dbProducts = await this.productModel.find({
                    name: { $in: ingredientList.map(i => i.toLowerCase()) }
                });

                const ingredientIds = dbProducts.map(p => p._id);

                const exists = await this.recipeModel.findOne({
                    title: full.strMeal
                });

                if (exists) {
                    importedRecipes.push({
                        product,
                        recipe: exists,
                        message: "Déjà existante"
                    });
                    continue;
                }

                const recipe = await this.recipeModel.create({
                    title: full.strMeal,
                    image: full.strMealThumb,
                    instructions: full.strInstructions,
                    ingredientList,
                    measuresList,
                    category: full.strCategory,
                    area: full.strArea,
                    tags: full.strTags ? full.strTags.split(",") : [],
                    ingredients: ingredientIds,
                    user: userId,
                    sourceUrl: full.strSource,
                    youtubeUrl: full.strYoutube
                });

                importedRecipes.push({
                    product,
                    recipe,
                    message: "Importée"
                });

            } catch (err) {
                console.error(err);
            }
        }

        return {
            message: "Import terminé",
            count: importedRecipes.length,
            data: importedRecipes
        };
    }

    // ---------------------------------------------------
    // 5. RECETTES EXACTES (100% faisables)
    // ---------------------------------------------------

    async recipesUsingExistingProducts(userId: string) {
        const userProducts = await this.productModel.find({ user: userId });

        if (!userProducts.length) {
            return { message: "Aucun produit.", recipes: [] };
        }

        const productNames = userProducts.map(p => p.name.toLowerCase().trim());
        const recipes = await this.recipeModel.find();

        const result = recipes.filter(recipe => {
            const ing: string[] = [];

            for (let i = 1; i <= 20; i++) {
                const v = recipe[`strIngredient${i}`];
                if (v) ing.push(v.toLowerCase());
            }

            return ing.every(i => productNames.includes(i));
        });

        return {
            message: "Recettes réalisables",
            count: result.length,
            recipes: result
        };
    }

    // ---------------------------------------------------
    // 6. RECETTES + INGRÉDIENTS MANQUANTS
    // ---------------------------------------------------

    async recipesUsingAllProductsPlusExtras(userId: string) {
        const userProducts = await this.productModel.find({ user: userId });

        if (!userProducts.length) {
            return { message: "Aucun produit.", recipes: [] };
        }

        const productNames = userProducts.map(p => p.name.toLowerCase());
        const allRecipes = await this.recipeModel.find().populate('ingredients');

        const results: RecipeWithMissing[] = allRecipes.map(recipe => {
            const ingredientNames = (recipe.ingredients ?? [])
                .map((i: any) => i.name.toLowerCase())
                .filter(Boolean);

            const missing = ingredientNames.filter(i => !productNames.includes(i));

            return {
                id: String(recipe._id),
                title: recipe.title,
                image: recipe.image,
                recipe,
                ingredients: ingredientNames,
                missingIngredients: missing,
                fullyMatched: missing.length === 0
            };
        });

        return {
            message: "Recettes analysées",
            total: results.length,
            recipes: results
        };
    }

    // ---------------------------------------------------
    // 7. UNE RECETTE PAR PRODUIT
    // ---------------------------------------------------

    async recipePerProduct(userId: string) {
        const userProducts = await this.productModel.find({ user: userId });

        if (!userProducts.length) {
            return { message: "Aucun produit.", count: 0, data: [] };
        }

        const allRecipes = await this.recipeModel.find().populate('ingredients');

        const result: RecipePerProduct[] = userProducts.map(p => {
            const name = p.name.toLowerCase();

            const recipe = allRecipes.find(r =>
                r.ingredients.some(i => i.name.toLowerCase() === name)
            ) || null;

            return {
                product: p.name,
                recipe,
                message: recipe ? "Recette trouvée" : "Aucune recette"
            };
        });

        return {
            message: "Recette par produit",
            count: result.length,
            data: result
        };
    }

    // ---------------------------------------------------
    // 10. Marquer une recette comme cuisinée
    // ---------------------------------------------------
    async cookRecipe(userId: string, recipeId: string) {
        // Trouver la recette
        const recipe = await this.recipeModel.findById(recipeId).populate('ingredients');
        if (!recipe) throw new NotFoundException('Recette non trouvée');

        // Ingrédients de la recette
        const recipeIngredients = recipe.ingredients.map((i: any) =>
            i.name.toLowerCase()
        );

        // Produits du frigo utilisateur
        const userProducts = await this.productModel.find({ user: userId });

        const productsToRemove = userProducts.filter(p =>
            recipeIngredients.includes(p.name.toLowerCase())
        );

        // Suppression des produits utilisés
        const deleted = await this.productModel.deleteMany({
            _id: { $in: productsToRemove.map(p => p._id) }
        });

        return {
            message: "Recette cuisinée",
            removedProducts: deleted.deletedCount,
            recipe: recipe.title,
        };
    }
    // recipes.service.ts (ajouter dans la classe RecipesService)
    async getRecipesBySingleIngredient(userId: string, productName: string) {
        const normalized = productName.toLowerCase().trim();

        // 1) produits de l'utilisateur
        const userProducts = await this.productModel.find({ user: userId });
        const userNames = userProducts.map(p => p.name.toLowerCase().trim());

        // 2) Recettes locales contenant l'ingrédient
        const allRecipes = await this.recipeModel.find().populate('ingredients').exec();
        const seenTitles = new Set<string>();

        const localMatches = allRecipes
            .filter((recipe: any) => {
                const fromList = (recipe.ingredientList ?? []).map((s: string) => s.toLowerCase().trim());
                const fromProducts = (recipe.ingredients ?? []).map((p: any) => (p.name || '').toLowerCase().trim());
                const combined = Array.from(new Set([...fromList, ...fromProducts]));
                return combined.includes(normalized);
            })
            .map((recipe: any) => {
                if (seenTitles.has(recipe.title)) return null; // ignorer doublon
                seenTitles.add(recipe.title);

                const ingredientNames = (recipe.ingredients ?? []).map((i: any) => (i.name || '').toLowerCase().trim());
                const listNames = (recipe.ingredientList ?? []).map((s: string) => s.toLowerCase().trim());
                const allIngredientNames = Array.from(new Set([...ingredientNames, ...listNames]));
                const missing = allIngredientNames.filter(i => !userNames.includes(i));

                return {
                    id: recipe._id.toString(),
                    title: recipe.title,
                    image: recipe.image,
                    recipe,
                    ingredients: allIngredientNames,
                    missingIngredients: missing,
                    fullyMatched: missing.length === 0
                };
            })
            .filter(Boolean); // enlever les nulls

        // 3) Recettes externes
        const externalResults: any[] = [];
        const seenIds = new Set<string>();

        try {
            const filterRes = await axios.get(
                `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(normalized)}`
            );
            const meals = filterRes.data.meals || [];

            for (const meal of meals.slice(0, 10)) {
                if (seenIds.has(meal.idMeal)) continue;
                try {
                    const lookup = await axios.get(
                        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                    );
                    const full = lookup.data.meals?.[0];
                    if (!full) continue;

                    const ingredientList: string[] = [];
                    for (let i = 1; i <= 20; i++) {
                        const ing = full[`strIngredient${i}`];
                        if (ing && ing.trim() !== '') ingredientList.push(ing.toLowerCase().trim());
                    }

                    const missing = ingredientList.filter(i => !userNames.includes(i));

                    externalResults.push({
                        idMeal: full.idMeal,
                        title: full.strMeal,
                        image: full.strMealThumb,
                        ingredientList,
                        missingIngredients: missing,
                        fullyMatched: missing.length === 0,
                        source: 'mealdb',
                        details: full
                    });

                    seenIds.add(full.idMeal);
                } catch (e) { /* ignorer erreur d'une seule meal */ }
            }
        } catch (e) {
            console.error('MealDB error', e?.message ?? e);
        }

        return {
            message: 'Recettes pour produit',
            product: normalized,
            localCount: localMatches.length,
            externalCount: externalResults.length,
            local: localMatches,
            external: externalResults
        };
    }


}
