import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductsService } from '../../../../core/services/products.service';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ComponentCardComponent],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  loading = true;
  errorMessage = '';
  categories: string[] = [];
  selectedCategory = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 3;

  constructor(private productsService: ProductsService, private router: Router) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id;
    if (!userId) {
      this.errorMessage = 'Utilisateur non trouvé dans le localStorage.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.productsService.getActiveProducts(userId).subscribe({
      next: (res) => {
        this.products = res.sort((a: any, b: any) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        );

        this.categories = Array.from(new Set(this.products.map(p => p.category)));
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors de la récupération des produits.';
        this.loading = false;
      },
    });
  }

  applyFilter() {
    if (this.selectedCategory) {
      this.filteredProducts = this.products.filter(p => p.category === this.selectedCategory);
    } else {
      this.filteredProducts = [...this.products];
    }
    this.currentPage = 1;
  }

  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredProducts.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  markAsUsed(productId: string) {
    if (!confirm('Êtes-vous sûr de vouloir marquer ce produit comme utilisé ?')) return;

    this.productsService.markProductAsConsumed(productId).subscribe({
      next: (updatedProduct) => {
        alert('Produit marqué comme consommé.');
        this.loadProducts(); // recharge la liste
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la mise à jour du produit.');
      }
    });
  }


  deleteProduct(productId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    this.productsService.deleteProduct(productId).subscribe({
      next: () => {
        alert('Produit supprimé avec succès.');
        this.loadProducts();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la suppression du produit.');
      }
    });
  }


  suggestForProduct(productName: string) {
    // Redirige vers la page de suggestions de recettes pour ce produit
    this.router.navigate(['/recipes/from-product', encodeURIComponent(productName)]);
  }
}
