import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ProductsService } from '../../core/services/products.service';
import { AuthService } from '../../core/services/auth.service';
import { NgChartsModule } from 'ng2-charts'; 

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './statistics.component.html',
})

export class StatisticsComponent implements OnInit {

  userId!: string;

  consumedProducts: any[] = [];
  expiredProducts: any[] = [];
  activeProducts: any[] = [];

  pieChartData!: ChartData<'pie'>;
  barChartData!: ChartData<'bar'>;
  lineChartData!: ChartData<'line'>;

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
  };

  constructor(
    private productsService: ProductsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userObj = JSON.parse(userString);
      this.userId = userObj._id;
      this.loadStatistics();
    }
  }

  loadStatistics() {
    this.productsService.getConsumedProducts(this.userId).subscribe(consumed => {
      this.consumedProducts = consumed;
      this.updateCharts();
    });

    this.productsService.getExpiredProducts(this.userId).subscribe(expired => {
      this.expiredProducts = expired;
      this.updateCharts();
    });

    this.productsService.getActiveProducts(this.userId).subscribe(active => {
      this.activeProducts = active;
      this.updateCharts();
    });
  }

  updateCharts() {
    this.pieChartData = {
      labels: ['Consumed', 'Expired'],
      datasets: [{
        data: [this.consumedProducts.length, this.expiredProducts.length],
        backgroundColor: ['#4caf50', '#f44336'],
      }]
    };

    this.barChartData = {
      labels: ['Consumed', 'Expired', 'Active'],
      datasets: [{
        label: 'Number of products',
        data: [this.consumedProducts.length, this.expiredProducts.length, this.activeProducts.length],
        backgroundColor: ['#4caf50', '#f44336', '#2196f3'],
      }]
    };

    const groupedByMonth: { [key: string]: number } = {};
    this.expiredProducts.forEach(p => {
      const date = new Date(p.expiryDate);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      groupedByMonth[key] = (groupedByMonth[key] || 0) + 1;
    });

    const labels = Object.keys(groupedByMonth).sort();
    const values = labels.map(label => groupedByMonth[label]);

    this.lineChartData = {
      labels,
      datasets: [{
        label: 'Expired products',
        data: values,
        borderColor: '#f44336',
        backgroundColor: '#f44336',
        fill: false,
      }]
    };
  }
}
