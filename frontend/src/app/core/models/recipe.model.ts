export interface Recipe {
  _id: string;
  title: string;
  image?: string;
  instructions?: string;
  ingredients?: string[];       // noms des ingrédients
  measuresList?: string[];      // mesures correspondantes
  category?: string;
  area?: string;
  tags?: string[];
  sourceUrl?: string;
  youtubeUrl?: string;
  fullyMatched?: boolean;       // si tous les ingrédients sont disponibles
  missingIngredients?: string[];// si certains ingrédients manquent
}
