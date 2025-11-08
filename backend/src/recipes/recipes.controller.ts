import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { Recipe } from './schemas/recipe.schema';

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) { }

    // CRUD local
    @Post('add')
    async addRecipe(@Body() recipeData: Partial<Recipe>): Promise<Recipe> {
        return this.recipesService.addRecipe(recipeData);
    }

    @Get('all')
    async findAll(): Promise<Recipe[]> {
        return this.recipesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Recipe> {
        return this.recipesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.recipesService.delete(id);
    }

    @Get('byProductsMeal/:userId')
    async recommendMeal(@Param('userId') userId: string) {
        return this.recipesService.recommendRecipesMeal(userId);
    }
}
