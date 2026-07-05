import { Component, OnInit, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule, FormsModule,
    NzCardModule, NzSelectModule, NzInputNumberModule,
    NzButtonModule, NzTableModule, NzSpinModule, NzAlertModule, NzTagModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 style="font-size:24px;margin-bottom:16px">My Accounts</h1>

    <nz-card style="margin-bottom:16px">
      User:
      <nz-select [(ngModel)]="selectedUserId" (ngModelChange)="onUserChange()" style="width:180px;margin-left:8px">
        <nz-option [nzValue]="1" nzLabel="Alice (ID: 1)"></nz-option>
        <nz-option [nzValue]="2" nzLabel="Bob (ID: 2)"></nz-option>
      </nz-select>
    </nz-card>

    <nz-card style="margin-bottom:16px">
      <h3 style="font-size:16px;margin-bottom:12px;font-weight:500">New Account</h3>
      Currency:
      <nz-select [(ngModel)]="newCurrency" style="width:100px;margin-left:8px">
        <nz-option nzValue="EUR" nzLabel="EUR"></nz-option>
        <nz-option nzValue="USD" nzLabel="USD"></nz-option>
        <nz-option nzValue="SEK" nzLabel="SEK"></nz-option>
        <nz-option nzValue="GBP" nzLabel="GBP"></nz-option>
        <nz-option nzValue="VND" nzLabel="VND"></nz-option>
      </nz-select>
      <nz-input-number [(ngModel)]="newBalance" style="margin-left:8px" nzPlaceholder="Initial balance"></nz-input-number>
      <button nz-button nzType="primary" (click)="createAccount()" [disabled]="loading()" style="margin-left:8px">Create Account</button>
    </nz-card>

    @if (error()) {
      <nz-alert nzType="error" [nzMessage]="error()!" style="margin-bottom:16px"></nz-alert>
    }

    @if (loading()) {
      <div style="text-align:center;padding:40px"><nz-spin></nz-spin></div>
    }

    @if (!loading()) {
      @if (accounts().length === 0) {
        <div>No accounts found.</div>
      } @else {
        <nz-table [nzData]="accounts()" [nzPageSize]="50" [nzShowPagination]="false">
          <thead>
            <tr>
              <th>Currency</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            @for (acc of accounts(); track acc.id) {
              <tr [routerLink]="['/account', acc.id]" style="cursor:pointer">
                <td><nz-tag>{{ acc.currency }}</nz-tag></td>
                <td>{{ acc.balance.toFixed(2) }} {{ acc.currency }}</td>
              </tr>
            }
          </tbody>
        </nz-table>
      }
    }
  `,
})
export class HomeComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(false);
  readonly accounts = signal<any[]>([]);
  readonly error = signal<string | null>(null);

  selectedUserId = 1;
  newCurrency = 'EUR';
  newBalance = 0;

  ngOnInit() {
    this.selectedUserId = this.userService.userId;
    this.loadAccounts();
  }

  onUserChange() {
    const name = this.selectedUserId === 1 ? 'Alice' : 'Bob';
    this.userService.selectUser(this.selectedUserId, name);
    this.loadAccounts();
  }

  createAccount() {
    this.loading.set(true);
    this.error.set(null);
    this.api.createAccount(this.selectedUserId, this.newCurrency, this.newBalance).subscribe({
      next: () => {
        this.newBalance = 0;
        this.loadAccounts();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to create account.');
        this.cdr.markForCheck();
      },
    });
  }

  private loadAccounts() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getAccounts(this.selectedUserId).pipe(
      finalize(() => {
        this.loading.set(false);
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: accounts => {
        this.accounts.set(accounts);
      },
      error: () => {
        this.error.set('Failed to load accounts.');
      },
    });
  }
}
