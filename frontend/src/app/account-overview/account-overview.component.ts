import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Account } from '../models/account';
import { Transaction } from '../models/transaction';
import { ApiService } from '../services/api.service';

Chart.register(...registerables);

@Component({
  selector: 'app-account-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div>
      <a [routerLink]="['/']">Back to Home</a>

      <h2 *ngIf="account">Account #{{ account.id }}</h2>
      <table *ngIf="account">
        <tr>
          <td>Balance</td>
          <td>{{ account.balance.toFixed(2) }} {{ account.currency }}</td>
        </tr>
      </table>

      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error">{{ error }}</div>

      <table>
        <tr>
          <td>Deposit / debit amount</td>
          <td><input type="number" [(ngModel)]="actionAmount" placeholder="Amount" /></td>
          <td><button (click)="deposit()">Deposit</button></td>
          <td><button (click)="debit()">Debit</button></td>
        </tr>
      </table>

      <h3>Currency Exchange</h3>
      <table>
        <tr>
          <td>Amount</td>
          <td><input type="number" [(ngModel)]="exchangeAmount" placeholder="Amount" /></td>
        </tr>
        <tr>
          <td>To account</td>
          <td>
            <select [(ngModel)]="exchangeToAccountId">
              <option *ngFor="let a of allAccounts" [ngValue]="a.id">
                {{ a.currency }} (ID: {{ a.id }})
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td></td>
          <td><button (click)="exchange()">Exchange</button></td>
        </tr>
      </table>

      <h3>Transaction History</h3>
      <div class="transaction-list" #scrollContainer (scroll)="onScroll(scrollContainer)">
        <table>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
          <tr *ngFor="let t of transactions" [routerLink]="['/transaction', t.id]">
            <td>{{ t.type }}</td>
            <td>{{ t.amount.toFixed(2) }} {{ t.currency }}</td>
            <td>{{ t.timestamp | date:'short' }}</td>
          </tr>
        </table>
      </div>
      <div *ngIf="loadingMore">Loading more...</div>

      <h3>Balance History</h3>
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .transaction-list { max-height: 400px; overflow-y: auto; }
  `]
})
export class AccountOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  account: Account | null = null;
  transactions: Transaction[] = [];
  allAccounts: Account[] = [];
  loading = false;
  loadingMore = false;
  error = '';
  actionAmount = 0;
  exchangeAmount = 0;
  exchangeToAccountId = 0;

  private accountId = 0;
  private page = 0;
  private readonly pageSize = 20;
  private chart: Chart | null = null;
  private chartTransactions: Transaction[] = [];
  private viewReady = false;
  private allLoaded = false;

  ngOnInit() {
    this.accountId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAccount();
    this.loadTransactions(true);
    this.loadChart();
  }

  ngAfterViewInit() {
    this.viewReady = true;
    if (this.chartTransactions.length) this.renderChart(this.chartTransactions);
  }

  ngOnDestroy() {
    if (this.chart) this.chart.destroy();
  }

  onScroll(el: HTMLElement) {
    if (el.scrollHeight - el.scrollTop < el.clientHeight + 50 && !this.loadingMore && !this.allLoaded) {
      this.loadTransactions(false);
    }
  }

  deposit() {
    this.api.deposit(this.accountId, this.actionAmount).subscribe({
      next: account => this.afterBalanceChange(account),
      error: () => this.error = 'Deposit failed.',
    });
  }

  debit() {
    this.api.debit(this.accountId, this.actionAmount).subscribe({
      next: account => this.afterBalanceChange(account),
      error: () => this.error = 'Debit failed.',
    });
  }

  exchange() {
    if (!this.exchangeToAccountId) return;
    this.api.exchange(this.accountId, this.exchangeToAccountId, this.exchangeAmount).subscribe({
      next: accounts => {
        const current = accounts.find(a => a.id === this.accountId);
        if (current) this.afterBalanceChange(current);
      },
      error: () => this.error = 'Exchange failed.',
    });
  }

  private loadAccount() {
    this.loading = true;
    this.error = '';

    this.api.getAccount(this.accountId).subscribe({
      next: account => {
        this.account = account;
        this.loadOtherAccounts(account.userId);
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load account.';
        this.loading = false;
      },
    });
  }

  private loadOtherAccounts(userId: number) {
    this.api.getAccounts(userId).subscribe(accounts => {
      this.allAccounts = accounts.filter(a => a.id !== this.accountId);
    });
  }

  private loadTransactions(reset: boolean) {
    if (reset) {
      this.page = 0;
      this.transactions = [];
      this.allLoaded = false;
    }

    this.loadingMore = true;
    this.api.getTransactions(this.accountId, this.page, this.pageSize).subscribe({
      next: transactions => {
        this.transactions = [...this.transactions, ...transactions];
        this.allLoaded = transactions.length < this.pageSize;
        this.page++;
        this.loadingMore = false;
      },
      error: () => {
        this.error = 'Could not load transactions.';
        this.loadingMore = false;
      },
    });
  }

  private loadChart() {
    this.api.getAllTransactions(this.accountId).subscribe(transactions => {
      this.chartTransactions = transactions;
      if (this.viewReady && transactions.length) this.renderChart(transactions);
    });
  }

  private afterBalanceChange(account: Account) {
    this.account = account;
    this.actionAmount = 0;
    this.exchangeAmount = 0;
    this.error = '';
    this.loadTransactions(true);
    this.loadChart();
  }

  private renderChart(data: Transaction[]) {
    if (this.chart) this.chart.destroy();
    const ctx = (this.chartCanvas?.nativeElement as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(t => new Date(t.timestamp).toLocaleDateString()),
        datasets: [{
          label: 'Balance',
          data: data.map(t => t.balanceAfter),
          borderColor: '#3b82f6',
          fill: false,
          tension: 0.1,
        }],
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Date' } },
          y: { title: { display: true, text: 'Balance' } },
        },
      },
    });
  }
}
