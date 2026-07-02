import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import { Transaction } from '../models/transaction';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-transaction-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <a *ngIf="transaction" [routerLink]="['/account', transaction.accountId]">Back to Account</a>

      <div *ngIf="error">{{ error }}</div>

      <div *ngIf="transaction as t">
        <h2>Transaction #{{ t.id }}</h2>
        <table>
          <tr><td>Type</td><td>{{ t.type }}</td></tr>
          <tr><td>Amount</td><td>{{ t.amount.toFixed(2) }} {{ t.currency }}</td></tr>
          <tr><td>Balance Before</td><td>{{ t.balanceBefore.toFixed(2) }} {{ t.currency }}</td></tr>
          <tr><td>Balance After</td><td>{{ t.balanceAfter.toFixed(2) }} {{ t.currency }}</td></tr>
          <tr><td>Date</td><td>{{ t.timestamp | date:'medium' }}</td></tr>
        </table>

        <button (click)="exportPdf()">Export as PDF</button>
      </div>
    </div>
  `
})
export class TransactionOverviewComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  transaction: Transaction | null = null;
  error = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getTransaction(id).subscribe({
      next: transaction => this.transaction = transaction,
      error: () => this.error = 'Could not load transaction.',
    });
  }

  exportPdf() {
    if (!this.transaction) return;

    const doc = new jsPDF();
    doc.text('Transaction Summary', 20, 20);
    doc.text(`ID: ${this.transaction.id}`, 20, 40);
    doc.text(`Type: ${this.transaction.type}`, 20, 50);
    doc.text(`Amount: ${this.transaction.amount.toFixed(2)} ${this.transaction.currency}`, 20, 60);
    doc.text(`Balance Before: ${this.transaction.balanceBefore.toFixed(2)} ${this.transaction.currency}`, 20, 70);
    doc.text(`Balance After: ${this.transaction.balanceAfter.toFixed(2)} ${this.transaction.currency}`, 20, 80);
    doc.text(`Date: ${new Date(this.transaction.timestamp).toLocaleString()}`, 20, 90);
    doc.save(`transaction-${this.transaction.id}.pdf`);
  }
}
