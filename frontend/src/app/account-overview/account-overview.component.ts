import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';

Chart.register(...registerables);

@Component({
  selector: 'app-account-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, RouterModule, FormsModule,
    NzCardModule, NzInputNumberModule, NzSelectModule,
    NzButtonModule, NzTableModule, NzSpinModule, NzAlertModule, NzTagModule,
  ],
  template: `
    <div>
      <a routerLink="/" nz-button nzType="link">&larr; Back to Home</a>

      @if (account()) {
        <nz-card style="margin-bottom:16px">
          <h2 style="font-size:20px;font-weight:500">Account #{{ account()!.id }}</h2>
          <span style="font-size:24px;font-weight:700">{{ account()!.balance.toFixed(2) }} {{ account()!.currency }}</span>
        </nz-card>
      }

      @if (loading()) {
        <div style="text-align:center;padding:24px"><nz-spin></nz-spin></div>
      }
      @if (error()) {
        <nz-alert nzType="error" [nzMessage]="error()!" style="margin-bottom:16px"></nz-alert>
      }

      <nz-card style="margin-bottom:16px">
        <h3 style="font-size:16px;font-weight:500;margin-bottom:12px">Deposit / Debit</h3>
        Amount:
        <nz-input-number [(ngModel)]="actionAmount" nzPlaceholder="Amount" style="margin-left:8px"></nz-input-number>
        <button nz-button nzType="primary" (click)="deposit()" style="margin-left:8px">Deposit</button>
        <button nz-button nzDanger (click)="debit()" style="margin-left:8px">Debit</button>
      </nz-card>

      <nz-card style="margin-bottom:16px">
        <h3 style="font-size:16px;font-weight:500;margin-bottom:12px">Currency Exchange</h3>

        @if (currentRates().length > 0) {
          <div style="margin-bottom:12px;font-size:13px;color:#666">
            <strong>Current Rates (1 {{ account()?.currency }}):</strong>
            <div style="display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:6px">
              @for (r of currentRates(); track r.id) {
                <span>{{ r.rate }} {{ r.toCurrency }}</span>
              }
            </div>
          </div>
        }

        Amount:
        <nz-input-number [(ngModel)]="exchangeAmount" nzPlaceholder="Amount" style="margin-left:8px"></nz-input-number>
        To account:
        <nz-select [(ngModel)]="exchangeToAccountId" style="width:180px;margin-left:8px">
          @for (a of allAccounts(); track a.id) {
            <nz-option [nzValue]="a.id" [nzLabel]="a.currency + ' (ID: ' + a.id + ')'"></nz-option>
          }
        </nz-select>
        <button nz-button nzType="primary" (click)="exchange()" style="margin-left:8px">Exchange</button>
      </nz-card>

      <nz-card style="margin-bottom:16px">
        <h3 style="font-size:16px;font-weight:500;margin-bottom:12px">Transaction History</h3>
        <div class="transaction-list" #scrollContainer (scroll)="onScroll(scrollContainer)">
          <nz-table [nzData]="transactions()" [nzPageSize]="50" [nzShowPagination]="false">
            <thead>
              <tr><th>Type</th><th>Amount</th><th>Date</th></tr>
            </thead>
            <tbody>
          @for (t of transactions(); track t.id) {
            <tr [routerLink]="['/transaction', t.id]" style="cursor:pointer">
              <td><nz-tag [nzColor]="typeColor(t.type)">{{ t.type }}</nz-tag></td>
              <td>{{ t.amount.toFixed(2) }} {{ t.currency }}</td>
              <td>{{ t.timestamp | date:'yyyy-MM-dd HH:mm:ss' }}</td>
            </tr>
          }
            </tbody>
          </nz-table>
        </div>
        @if (transactionsLoading()) {
          <div style="text-align:center;padding:12px"><nz-spin></nz-spin></div>
        }
      </nz-card>

      <nz-card>
        <h3 style="font-size:16px;font-weight:500;margin-bottom:12px">Balance History</h3>
        <canvas #chartCanvas></canvas>
      </nz-card>
    </div>
  `,
  styles: [`
    .transaction-list { max-height: 400px; overflow-y: auto; }
  `]
})
export class AccountOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  private readonly api = inject(ApiService);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly account = signal<any>(null);
  readonly transactions = signal<any[]>([]);
  readonly allAccounts = signal<any[]>([]);
  readonly exchangeRates = signal<any[]>([]);
  readonly loading = signal(false);
  readonly transactionsLoading = signal(false);
  readonly error = signal<string | null>(null);
  actionAmount = 0;
  exchangeAmount = 0;
  exchangeToAccountId = 0;

  private accountId = 0;
  private page = 0;
  private readonly pageSize = 20;
  private chart: Chart | null = null;
  private chartData: any[] = [];
  private viewReady = false;
  private allLoaded = false;

  readonly currentRates = () => {
    const acc = this.account();
    if (!acc) return [];
    return this.exchangeRates().filter(r => r.fromCurrency === acc.currency);
  };

  ngOnInit() {
    this.accountId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAccount();
    this.loadExchangeRates();
    this.loadAllAccounts();
    this.loadTransactions(true);
    this.loadChart();
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnDestroy() {
    if (this.chart) this.chart.destroy();
  }

  onScroll(el: HTMLElement) {
    if (el.scrollHeight - el.scrollTop < el.clientHeight + 50 && !this.transactionsLoading && !this.allLoaded) {
      this.loadTransactions(false);
    }
  }

  deposit() {
    this.loading.set(true);
    this.error.set(null);
    this.api.deposit(this.accountId, this.actionAmount).subscribe({
      next: acc => { this.account.set(acc); this.actionAmount = 0; this.loading.set(false); this.onActionDone(); this.cdr.markForCheck(); },
      error: () => { this.error.set('Deposit failed.'); this.loading.set(false); this.cdr.markForCheck(); },
    });
  }

  debit() {
    this.loading.set(true);
    this.error.set(null);
    this.api.debit(this.accountId, this.actionAmount).subscribe({
      next: acc => { this.account.set(acc); this.actionAmount = 0; this.loading.set(false); this.onActionDone(); this.cdr.markForCheck(); },
      error: () => { this.error.set('Debit failed.'); this.loading.set(false); this.cdr.markForCheck(); },
    });
  }

  exchange() {
    if (!this.exchangeToAccountId) return;
    this.loading.set(true);
    this.error.set(null);
    this.api.exchange(this.accountId, this.exchangeToAccountId, this.exchangeAmount).subscribe({
      next: () => { this.exchangeAmount = 0; this.loading.set(false); this.onActionDone(); this.cdr.markForCheck(); },
      error: () => { this.error.set('Exchange failed.'); this.loading.set(false); this.cdr.markForCheck(); },
    });
  }

  private onActionDone() {
    this.loadAccount();
    this.loadTransactions(true);
    this.loadChart();
    this.loadAllAccounts();
  }

  private loadAccount() {
    this.api.getAccount(this.accountId).subscribe(acc => { this.account.set(acc); this.cdr.markForCheck(); });
  }

  private loadAllAccounts() {
    this.api.getAccounts(this.userService.userId).subscribe(accounts => {
      this.allAccounts.set(accounts.filter(a => a.id !== this.accountId));
      this.cdr.markForCheck();
    });
  }

  private loadExchangeRates() {
    this.api.getExchangeRates().subscribe(rates => { this.exchangeRates.set(rates); this.cdr.markForCheck(); });
  }

  private loadTransactions(reset: boolean) {
    if (reset) { this.page = 0; this.allLoaded = false; }
    this.transactionsLoading.set(true);
    this.api.getTransactions(this.accountId, this.page, this.pageSize).subscribe({
      next: txs => {
        this.transactions.set(reset ? txs : [...this.transactions(), ...txs]);
        this.allLoaded = txs.length < this.pageSize;
        this.page++;
        this.transactionsLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.transactionsLoading.set(false); this.cdr.markForCheck(); },
    });
  }

  private loadChart() {
    this.api.getAllTransactions(this.accountId).subscribe(data => {
      this.chartData = data;
      if (this.viewReady) this.renderChart();
      this.cdr.markForCheck();
    });
  }

  typeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'deposit': return 'green';
      case 'debit': return 'red';
      case 'exchange_out': return 'blue';
      case 'exchange_in': return 'purple';
      default: return 'default';
    }
  }

  private renderChart() {
    if (!this.chartData.length || !this.chartCanvas) return;
    if (this.chart) this.chart.destroy();

    const ctx = (this.chartCanvas.nativeElement as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.chartData.map(t => new Date(t.timestamp).toLocaleDateString()),
        datasets: [{
          label: 'Balance',
          data: this.chartData.map(t => t.balanceAfter),
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
