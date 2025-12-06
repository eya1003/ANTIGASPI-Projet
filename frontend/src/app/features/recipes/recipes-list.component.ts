import { Component, OnInit } from '@angular/core';
import { RecipesService, Recipe } from '../../core/services/recipes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recipes-list.component.html',
})
export class RecipesListComponent implements OnInit {
  recipes: Recipe[] = [];
  loading = true;
  errorMessage = '';

  constructor(private recipesService: RecipesService, private router: Router) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id;

    if (!userId) {
      this.errorMessage = 'Utilisateur non trouvé.';
      this.loading = false;
      return;
    }

    // Exemple : récupération recettes réalisables à 100%
    this.recipesService.getRecipesByExactProducts(userId).subscribe({
      next: (res) => {
        this.recipes = res.recipes || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors de la récupération des recettes.';
        this.loading = false;
      },
    });
  }

  viewRecipe(recipeId: string) {
    this.router.navigate(['/recipes', recipeId]);
  }

  cookRecipe(recipe: Recipe) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!confirm(`Confirmer que vous avez cuisiné: ${recipe.title} ?`)) return;

  this.recipesService.cookRecipe(user._id, recipe._id).subscribe({
    next: () => {
      this.recipes = this.recipes.filter(r => r._id !== recipe._id);
      alert('Préparation validée ! Les ingrédients ont été retirés du frigo.');
    },
    error: () => alert('Erreur serveur.')
  });
}

}
