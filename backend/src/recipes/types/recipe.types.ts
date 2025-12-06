export interface ImportedRecipeResult {
    product: string;
    recipe: any | null;
    message: string;
}

export interface RecipeWithMissing {
    id: string;
    title: string;
    image?: string;
    recipe: any;
    ingredients: string[];
    missingIngredients: string[];
    fullyMatched: boolean;
}


export interface RecipePerProduct {
    product: string;
    recipe: any | null;
    message: string;
}
