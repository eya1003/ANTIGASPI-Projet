// src/recipes/recipe-detail/recipe-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RecipesService } from '../../core/services/recipes.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-recipe-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './recipe-detail.component.html',
})
export class RecipeDetailComponent implements OnInit {
    recipeId = '';
    userId = '';
    loading = true;
    error = '';
    recipe: any = null;
    isExternal = false; // true si c'est une recette externe

    constructor(private route: ActivatedRoute, private recipesService: RecipesService) { }

    ngOnInit(): void {
        const routeId = this.route.snapshot.paramMap.get('id');
        if (!routeId) {
            this.error = 'ID de recette introuvable';
            this.loading = false;
            return;
        }

        const isExternal = this.route.snapshot.url[0].path === 'external';

        if (isExternal) {
            this.loading = true;
            this.recipesService.getExternalRecipeById(routeId).subscribe({
                next: (res) => {
                    this.recipe = res;
                    this.loading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.error = 'Recette externe introuvable';
                    this.loading = false;
                }
            });
        } else {
            this.recipesService.getRecipeById(routeId).subscribe({
                next: (res) => {
                    this.recipe = res;
                    this.loading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.error = 'Recette locale introuvable';
                    this.loading = false;
                }
            });
        }
    }


    loadRecipe() {
        // on peut distinguer recettes locales / externes par id ou param
        this.recipesService.getRecipeById(this.recipeId).subscribe({
            next: (res: any) => {
                this.recipe = res;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.error = 'Erreur serveur ou recette externe';
                this.loading = false;
                this.isExternal = true;
                // optionnel : charger les détails externes depuis MealDB
            }
        });
    }

    cookRecipe() {
        if (!confirm(`Confirmer que vous avez cuisiné ${this.recipe.title} ?`)) return;
        this.recipesService.cookRecipe(this.userId, this.recipe._id).subscribe({
            next: () => alert('Recette marquée cuisinée et ingrédients retirés.'),
            error: () => alert('Erreur serveur')
        });
    }

    openExternal() {
        if (this.recipe.sourceUrl) window.open(this.recipe.sourceUrl, '_blank');
        else if (this.recipe.youtubeUrl) window.open(this.recipe.youtubeUrl, '_blank');
        else alert('Lien externe non disponible');
    }
}
