import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Account } from '../models/account';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div>
      <h1>My Accounts</h1>

      <table>
        <tr>
          <td>User</td>
          <td>
            <select [(ngModel)]="selectedUserId">
              <option [ngValue]="1">Alice (ID: 1)</option>
              <option [ngValue]="2">Bob (ID: 2)</option>
            </select>
          </td>
          <td><button (click)="loadAccounts()">Load Accounts</button></td>
        </tr>
        <tr>
          <td>New account</td>
          <td>
            <select [(ngModel)]="newCurrency">
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="SEK">SEK</option>
              <option value="GBP">GBP</option>
              <option value="VND">VND</option>
            </select>
            <input type="number" [(ngModel)]="newBalance" placeholder="Initial balance" />
          </td>
          <td><button (click)="createAccount()" [disabled]="loading">Create Account</button></td>
        </tr>
      </table>

      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error">{{ error }}</div>

      <div *ngIf="!loading && accounts.length === 0">No accounts found.</div>

      <table *ngIf="accounts.length > 0">
        <tr>
          <th>Currency</th>
          <th>Balance</th>
        </tr>
        <tr *ngFor="let acc of accounts" [routerLink]="['/account', acc.id]">
          <td>{{ acc.currency }}</td>
          <td>{{ acc.balance.toFixed(2) }} {{ acc.currency }}</td>
        </tr>
      </table>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private readonly api = inject(ApiService);

  accounts: Account[] = [];
  loading = false;
  error = '';
  selectedUserId = 1;
  newCurrency = 'EUR';
  newBalance = 0;

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading = true;
    this.error = '';

    this.api.getAccounts(this.selectedUserId).subscribe({
      next: accounts => {
        this.accounts = accounts;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load accounts.';
        this.loading = false;
      },
    });
  }

  createAccount() {
    this.loading = true;
    this.error = '';

    this.api.createAccount(this.selectedUserId, this.newCurrency, this.newBalance).subscribe({
      next: account => {
        this.accounts = [...this.accounts, account];
        this.newBalance = 0;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not create account.';
        this.loading = false;
      },
    });
  }
}
