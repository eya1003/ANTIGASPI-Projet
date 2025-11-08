import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductsService } from '../../../../core/services/products.service';
import { ComponentCardComponent } from '../../../../shared/components/common/component-card/component-card.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ComponentCardComponent],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  products: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(private productsService: ProductsService) {}

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
        this.products = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors de la récupération des produits.';
        this.loading = false;
      },
    });
  }
}