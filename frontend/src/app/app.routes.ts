import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AccountOverviewComponent } from './account-overview/account-overview.component';
import { TransactionOverviewComponent } from './transaction-overview/transaction-overview.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'account/:id', component: AccountOverviewComponent },
  { path: 'transaction/:id', component: TransactionOverviewComponent },
];
