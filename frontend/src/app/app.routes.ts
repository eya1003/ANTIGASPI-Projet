import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { VerifyComponent } from './features/auth/pages/verify/verify.component';
import { AddProductComponent } from './features/fridge/pages/add-product/add-product.component';
import { ProductsListComponent } from './features/fridge/pages/products-list/products-list.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title:
          'ANTIGASPI',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'form-elements',
        component: FormElementsComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'basic-tables',
        component: BasicTablesComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'fridge/add',
        component: AddProductComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'frigde',
        component: ProductsListComponent,
        title: 'ANTIGASPI',
      },
      // support tickets
      {
        path: 'invoice',
        component: InvoicesComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'line-chart',
        component: LineChartComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'bar-chart',
        component: BarChartComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'avatars',
        component: AvatarElementComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'badge',
        component: BadgesComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'buttons',
        component: ButtonsComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'images',
        component: ImagesComponent,
        title: 'ANTIGASPI',
      },
      {
        path: 'videos',
        component: VideosComponent,
        title: 'ANTIGASPI',
      },
    ]
  },

  // auth pages
  {
    path: 'signin',
    component: SignInComponent,
    title: 'ANTIGASPI',
  },
  {
    path: 'signup',
    component: SignUpComponent,
    title: 'ANTIGASPI',
  },
  {
    path: 'verify',
    component: VerifyComponent,
    title: 'ANTIGASPI',
  },
  // error pages
  {
    path: '**',
    component: NotFoundComponent,
    title: 'ANTIGASPI',
  },
];
