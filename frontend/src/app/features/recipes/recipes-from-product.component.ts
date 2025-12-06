import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecipesService } from '../../core/services/recipes.service';

@Component({
    selector: 'app-recipes-from-product',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './recipes-from-product.component.html',
})
export class RecipesFromProductComponent implements OnInit {
    productName = '';
    userId = '';
    loading = true;
    error = '';
    local: any[] = [];
    external: any[] = [];

    constructor(private route: ActivatedRoute, private recipesService: RecipesService) { }

    ngOnInit(): void {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.userId = user._id;
        this.productName = decodeURIComponent(this.route.snapshot.paramMap.get('name') || '');

        if (!this.userId) {
            this.error = 'Utilisateur non trouvé.';
            this.loading = false;
            return;
        }

        if (!this.productName) {
            this.error = 'Produit introuvable.';
            this.loading = false;
            return;
        }

        this.recipesService.getRecipesBySingleProduct(this.userId, this.productName)
            .subscribe({
                next: (res: any) => {
                    this.local = res.local || [];
                    this.external = res.external || [];
                    // tri : fullyMatched d'abord
                    this.local.sort((a: any, b: any) => (a.fullyMatched ? -1 : 1) - (b.fullyMatched ? -1 : 1));
                    this.external.sort((a: any, b: any) => (a.fullyMatched ? -1 : 1) - (b.fullyMatched ? -1 : 1));
                    this.loading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.error = 'Erreur serveur';
                    this.loading = false;
                }
            });
    }

    viewRecipeLocal(recipeId: string) {
        // navigate to recipe detail
        // assuming route /recipes/:id exists
        window.location.href = `/recipes/${recipeId}`;
    }

    viewRecipeExternal(details: any) {
        // open source URL if available else open mealdb page
        if (details.details?.strSource) window.open(details.details.strSource, '_blank');
        else window.open(`https://www.themealdb.com/meal/${details.idMeal}`, '_blank');
    }

    cookRecipeLocal(recipe: any) {
        if (!confirm(`Confirmer que vous avez cuisiné ${recipe.title} ?`)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.recipesService.cookRecipe(user._id, recipe.id).subscribe({
            next: () => {
                alert('Recette marquée cuisinée et ingrédients retirés.');
                // remove from list
                this.local = this.local.filter(r => r.id !== recipe.id);
            },
            error: () => alert('Erreur serveur')
        });
    }
}
