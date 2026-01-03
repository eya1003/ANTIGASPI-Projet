import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recipe {
    _id: string;
    title: string;
    image?: string;
    instructions?: string;
    ingredients?: string[];
    measuresList?: string[];
    category?: string;
    area?: string;
    tags?: string[];
    sourceUrl?: string;
    youtubeUrl?: string;
    fullyMatched?: boolean;
    missingIngredients?: string[];
}

@Injectable({ providedIn: 'root' })
export class RecipesService {
    private apiUrl = 'http://localhost:3000/recipes';

    constructor(private http: HttpClient) { }

    getRecipesByExactProducts(userId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/byExactProducts/${userId}`);
    }

    getRecipesByAllProductsPlusExtras(userId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/byAllProductsPlusExtras/${userId}`);
    }

    getRecipesByMealDB(userId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/byProductsMeal/${userId}`);
    }
    cookRecipe(userId: string, recipeId: string) {
        return this.http.post(
            `${this.apiUrl}/cook/${userId}/${recipeId}`,
            {}
        );
    }
    // recipes.service.ts
    getRecipesBySingleProduct(userId: string, productName: string) {
        return this.http.get(`${this.apiUrl}/bySingleProduct/${userId}/${encodeURIComponent(productName)}`);
    }
    cookExternalRecipe(userId: string, body: any) {
        return this.http.post(
            `http://localhost:3000/recipes/cook-external/${userId}`,
            body
        );
    }


    getRecipeById(id: string) {
        return this.http.get(`${this.apiUrl}/${id}`);
    }
    getExternalRecipeById(idMeal: string) {
        return this.http.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
    }

}
