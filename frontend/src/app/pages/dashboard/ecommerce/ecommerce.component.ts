import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { ProductsService } from '../../../core/services/products.service';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [NgChartsModule, ComponentCardComponent],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit {

  userId!: string;
  consumedProducts: any[] = [];
  expiredProducts: any[] = [];
  activeProducts: any[] = [];

  totalProducts = 0;

  pieChartData!: ChartData<'doughnut'>;
  barChartData!: ChartData<'bar'>;
  areaChartData!: ChartData<'line'>;

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 14 } } },
      tooltip: { enabled: true }
    },
    animation: {
      duration: 800,           // durée animation en ms
      easing: 'easeOutBounce'  // effet d'animation
    }
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true }
    },
    scales: {
      x: { stacked: true, beginAtZero: true },
      y: { stacked: true }
    },
    elements: { bar: { borderRadius: 8 } }
  };

  areaChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
    elements: { line: { tension: 0.4, borderWidth: 3 }, point: { radius: 5 } },
    scales: { x: { display: true }, y: { beginAtZero: true } },
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    }
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
    this.productsService.getConsumedProducts(this.userId).subscribe(c => { this.consumedProducts = c; this.updateCharts(); });
    this.productsService.getExpiredProducts(this.userId).subscribe(e => { this.expiredProducts = e; this.updateCharts(); });
    this.productsService.getActiveProducts(this.userId).subscribe(a => { this.activeProducts = a; this.updateCharts(); });
  }

  updateCharts() {
    this.totalProducts = this.consumedProducts.length + this.expiredProducts.length + this.activeProducts.length;

    // Doughnut chart
    this.pieChartData = {
      labels: ['Consumed', 'Expired'],
      datasets: [{
        data: [this.consumedProducts.length, this.expiredProducts.length],
        backgroundColor: ['#4caf50', '#f44336'],
        hoverOffset: 12
      }]
    };

    // Stacked Bar chart
    this.barChartData = {
      labels: ['Produits'],
      datasets: [
        { label: 'Consumed', data: [this.consumedProducts.length], backgroundColor: '#4caf50' },
        { label: 'Expired', data: [this.expiredProducts.length], backgroundColor: '#f44336' },
        { label: 'Active', data: [this.activeProducts.length], backgroundColor: '#2196f3' }
      ]
    };

    // Area chart (expired products over time)
    const grouped: { [key: string]: number } = {};
    this.expiredProducts.forEach(p => {
      const d = new Date(p.expiryDate);
      const key = `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });
    const labels = Object.keys(grouped).sort();
    const values = labels.map(l => grouped[l]);

    this.areaChartData = {
      labels,
      datasets: [{
        label: 'Expired products',
        data: values,
        borderColor: '#f44336',
        backgroundColor: 'rgba(244,67,54,0.2)',
        fill: true
      }]
    };
  }
}
