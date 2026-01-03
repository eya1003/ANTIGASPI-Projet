import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService } from '../../../core/services/recipes.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-recipe-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './recipe-detail.component.html',
    
})
export class RecipeDetailComponent implements OnInit {

    userId!: string;
    recipe: any = null;
    loading = true;
    error = '';
    isExternal = false;

    constructor(
        private route: ActivatedRoute,
        private recipesService: RecipesService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {

        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user || !user._id) {
            this.error = 'Utilisateur non connecté';
            this.loading = false;
            return;
        }
        this.userId = user._id;

        const recipeId = this.route.snapshot.paramMap.get('id');
        if (!recipeId) {
            this.error = 'ID de recette introuvable';
            this.loading = false;
            return;
        }

        this.isExternal = this.route.snapshot.url[0]?.path === 'external';

        if (this.isExternal) {
            this.recipesService.getExternalRecipeById(recipeId).subscribe({
                next: (res) => {
                    this.recipe = res;
                    this.loading = false;
                },
                error: () => {
                    this.error = 'Recette externe introuvable';
                    this.loading = false;
                }
            });
        } else {
            this.recipesService.getRecipeById(recipeId).subscribe({
                next: (res) => {
                    this.recipe = res;
                    this.loading = false;
                },
                error: () => {
                    this.error = 'Recette locale introuvable';
                    this.loading = false;
                }
            });
        }
    }

    cookRecipe() {
        console.log('CLICK OK');

        if (!confirm(`Confirmer que vous avez cuisiné ${this.recipe.title} ?`)) return;

        console.log('USER ID:', this.userId);
        console.log('RECIPE ID:', this.recipe._id);

        this.recipesService.cookRecipe(this.userId, this.recipe._id).subscribe({
            next: (res) => {
                console.log('API RESPONSE:', res);
                alert('Recette cuisinée, produits supprimés');
                this.router.navigate(['/']);
            },
            error: (err) => {
                console.error('API ERROR:', err);
                alert('Erreur serveur');
            }
        });
    }

    openExternal() {
        if (this.recipe?.sourceUrl) {
            window.open(this.recipe.sourceUrl, '_blank');
        }
    }

    cookExternalRecipe(ingredientList: string[]) {
        /*
    if (!ingredientList || ingredientList.length === 0) return;

    if (!confirm('Confirmer que vous avez cuisiné cette recette externe ?')) return;

    this.recipesService.cookExternalRecipe(this.userId, ingredientList).subscribe({
      next: (res) => {
        console.log('API RESPONSE:', res);
        alert(`Recette cuisinée ! Produits supprimés : ${res.removed.join(', ')}`);
        // Optionnel : recharger la liste de produits
        this.router.navigate(['/fridge']); 
      },    
      error: (err) => {
        console.error('API ERROR:', err);
        alert('Erreur serveur');
      }
    });*/
  }
}
