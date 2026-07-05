import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { jsPDF } from 'jspdf';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-transaction-overview',
  standalone: true,
  imports: [
    DatePipe, RouterModule,
    NzCardModule, NzButtonModule, NzTableModule, NzTagModule, NzAlertModule,
  ],
  template: `
    <div>
      @if (transaction) {
        <a [routerLink]="'/account/' + transaction.accountId" nz-button nzType="link">&larr; Back to Account</a>
      }

      @if (error) {
        <nz-alert nzType="error" [nzMessage]="error" style="margin-bottom:16px"></nz-alert>
      }

      @if (transaction) {
        <nz-card>
          <h2 style="font-size:20px;font-weight:500;margin-bottom:16px">Transaction #{{ transaction.id }}</h2>
          <nz-table [nzData]="[transaction]" [nzPageSize]="1" [nzShowPagination]="false">
            <thead>
              <tr><th>Field</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr><td>Type</td><td><nz-tag>{{ transaction.type }}</nz-tag></td></tr>
              <tr><td>Amount</td><td>{{ transaction.amount.toFixed(2) }} {{ transaction.currency }}</td></tr>
              <tr><td>Balance Before</td><td>{{ transaction.balanceBefore.toFixed(2) }} {{ transaction.currency }}</td></tr>
              <tr><td>Balance After</td><td>{{ transaction.balanceAfter.toFixed(2) }} {{ transaction.currency }}</td></tr>
              <tr><td>Date</td><td>{{ transaction.timestamp | date:'yyyy-MM-dd HH:mm:ss' }}</td></tr>
            </tbody>
          </nz-table>
          <button nz-button nzType="primary" (click)="exportPdf()" style="margin-top:12px">Export as PDF</button>
        </nz-card>
      }
    </div>
  `
})
export class TransactionOverviewComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  transaction: any = null;
  error: string | null = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getTransaction(id).subscribe({
      next: t => this.transaction = t,
      error: () => this.error = 'Failed to load transaction.',
    });
  }

  exportPdf() {
    const t = this.transaction;
    if (!t) return;

    const doc = new jsPDF();
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = new Date(t.timestamp);

    doc.text('Transaction Summary', 20, 20);
    doc.text(`ID: ${t.id}`, 20, 40);
    doc.text(`Type: ${t.type}`, 20, 50);
    doc.text(`Amount: ${t.amount.toFixed(2)} ${t.currency}`, 20, 60);
    doc.text(`Balance Before: ${t.balanceBefore.toFixed(2)} ${t.currency}`, 20, 70);
    doc.text(`Balance After: ${t.balanceAfter.toFixed(2)} ${t.currency}`, 20, 80);
    doc.text(`Date: ${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`, 20, 90);
    doc.save(`transaction-${t.id}.pdf`);
  }
}
