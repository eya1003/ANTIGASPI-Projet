import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductsService } from '../../../../core/services/products.service';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule,FormsModule, RouterModule, ComponentCardComponent],
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

  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id;

    if (!userId) {
      this.errorMessage = 'Utilisateur non trouvé dans le localStorage.';
      this.loading = false;
      return;
    }

    this.productsService.getUserProducts(userId).subscribe({
      next: (res) => {
        // Trier par date d'expiration (plus proche d'abord)
        this.products = res.sort((a: any, b: any) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        );

        // Récupérer les catégories uniques
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
      this.filteredProducts = this.products.filter(
        p => p.category === this.selectedCategory
      );
    } else {
      this.filteredProducts = [...this.products];
    }

    // Reset pagination
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

}
