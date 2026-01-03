import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { ProductsService } from '../../../core/services/products.service';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [NgChartsModule, ComponentCardComponent, DecimalPipe ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit {

  userId!: string;

  consumedProducts: any[] = [];
  expiredProducts: any[] = [];
  activeProducts: any[] = [];
  soonProducts: any[] = []; // produits qui vont expirer bientôt

  totalProducts = 0;
  wasteRate = 0; // % gaspillage

  // Charts
  pieChartData!: ChartData<'doughnut'>;
  barChartData!: ChartData<'bar'>;
  miniLineChartData!: ChartData<'line'>;

  // Chart options
  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 14 } } },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (tooltipItem: any) => {
            const value = tooltipItem.raw;
            const percent = ((value / this.totalProducts) * 100).toFixed(0);
            return `${tooltipItem.label}: ${value} (${percent}%)`;
          }
        }
      }
    },
    animation: { duration: 800, easing: 'easeOutBounce' }
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: { x: { beginAtZero: true }, y: { grid: { display: false } } },
    elements: { bar: { borderRadius: 6 } }
  };

  miniLineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: { x: { display: false }, y: { display: false } },
    elements: { 
      line: { tension: 0.4, borderWidth: 2, borderColor: '#ff9800' }, 
      point: { radius: 3, backgroundColor: '#ff9800' } 
    },
    animation: { duration: 600, easing: 'easeOutQuart' }
  };

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userObj = JSON.parse(userString);
      this.userId = userObj._id;
      this.loadStatistics();
    }
  }

  loadStatistics() {
    // Consommés
    this.productsService.getConsumedProducts(this.userId).subscribe(c => {
      this.consumedProducts = c;
      this.updateCharts();
    });

    // Expirés
    this.productsService.getExpiredProducts(this.userId).subscribe(e => {
      this.expiredProducts = e;
      this.updateCharts();
    });

    // Actifs
    this.productsService.getActiveProducts(this.userId).subscribe(a => {
      this.activeProducts = a;

      // Produits à consommer vite (3 jours avant expiration)
      this.soonProducts = a.filter(p => {
        const diffDays = Math.ceil((new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000*60*60*24));
        return diffDays > 0 && diffDays <= 3;
      });

      this.updateCharts();
    });
  }

  updateCharts() {
    this.totalProducts = this.consumedProducts.length + this.expiredProducts.length + this.activeProducts.length;
    this.wasteRate = this.totalProducts ? (this.expiredProducts.length / this.totalProducts) * 100 : 0;

    // Doughnut / Pie chart
    this.pieChartData = {
      labels: ['Consommés', 'Expirés', 'Actifs', 'À consommer vite'],
      datasets: [{
        data: [
          this.consumedProducts.length,
          this.expiredProducts.length,
          this.activeProducts.length,
          this.soonProducts.length
        ],
        backgroundColor: ['#4caf50', '#f44336', '#2196f3', '#ff9800'],
        hoverOffset: 10
      }]
    };

    // Horizontal Bar chart
    this.barChartData = {
      labels: ['Produits'],
      datasets: [
        { label: 'Consommés', data: [this.consumedProducts.length], backgroundColor: '#4caf50' },
        { label: 'Expirés', data: [this.expiredProducts.length], backgroundColor: '#f44336' },
        { label: 'Actifs', data: [this.activeProducts.length], backgroundColor: '#2196f3' },
        { label: 'À consommer vite', data: [this.soonProducts.length], backgroundColor: '#ff9800' }
      ]
    };

  }
}
