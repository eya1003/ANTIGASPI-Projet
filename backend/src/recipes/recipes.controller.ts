import {
    Controller, Get, Post, Param, Body, Delete
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { Recipe } from './schemas/recipe.schema';

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) { }

    // ---------------------------------------------------
    // 1. IMPORT AUTOMATIQUE — 1 recette par produit
    // ---------------------------------------------------
    @Get('importOneRecipePerProduct/:userId')
    importRecipePerProduct(@Param('userId') userId: string) {
        return this.recipesService.importOneRecipePerProduct(userId);
    }

    // ---------------------------------------------------
    // 2. RECETTES réalisables à 100%
    // ---------------------------------------------------
    @Get('byExactProducts/:userId')
    recipesExact(@Param('userId') userId: string) {
        return this.recipesService.recipesUsingExistingProducts(userId);
    }

    // ---------------------------------------------------
    // 3. RECETTES réalisables + ingrédients manquants
    // ---------------------------------------------------
    @Get('byAllProductsPlusExtras/:userId')
    recipesWithExtras(@Param('userId') userId: string) {
        return this.recipesService.recipesUsingAllProductsPlusExtras(userId);
    }

    // ---------------------------------------------------
    // 4. Associer "1 Recette → 1 Produit"
    // ---------------------------------------------------
    @Get('oneRecipePerProduct/:userId')
    recipePerProduct(@Param('userId') userId: string) {
        return this.recipesService.recipePerProduct(userId);
    }

    // ---------------------------------------------------
    // 5. Recommandation via API externe : TheMealDB
    // ---------------------------------------------------
    @Get('byProductsMeal/:userId')
    recommendMeal(@Param('userId') userId: string) {
        return this.recipesService.recommendRecipesMeal(userId);
    }

    // recipes.controller.ts (ajouter)
    @Get('bySingleProduct/:userId/:productName')
    getRecipesBySingleProduct(
        @Param('userId') userId: string,
        @Param('productName') productName: string
    ) {
        return this.recipesService.getRecipesBySingleIngredient(userId, productName);
    }

    @Post('cook-external/:userId')
    cookExternal(
        @Param('userId') userId: string,
        @Body() body: { ingredientList: string[]; recipeData: any }
    ) {
        return this.recipesService.cookExternalRecipe(
            userId,
            body.ingredientList,
            body.recipeData
        );
    }


    // ---------------------------------------------------
    // 11. Marquer une recette comme cuisinée
    // ---------------------------------------------------
    @Post('cook/:userId/:recipeId')
    cookRecipe(
        @Param('userId') userId: string,
        @Param('recipeId') recipeId: string
    ) {
        return this.recipesService.cookRecipe(userId, recipeId);
    }


    // ---------------------------------------------------
    // 6. CRUD : Ajouter une recette
    // ---------------------------------------------------
    @Post('add')
    addRecipe(@Body() recipeData: Partial<Recipe>): Promise<Recipe> {
        return this.recipesService.addRecipe(recipeData);
    }

    // ---------------------------------------------------
    // 7. CRUD : Lire toutes les recettes
    // ---------------------------------------------------
    @Get('all')
    findAll(): Promise<Recipe[]> {
        return this.recipesService.findAll();
    }

    // ---------------------------------------------------
    // 8. CRUD : Lire une recette par ID
    // ---------------------------------------------------
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.recipesService.findOne(id);
    }

    // ---------------------------------------------------
    // 9. CRUD : Supprimer une recette
    // ---------------------------------------------------
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.recipesService.delete(id);
    }
}
