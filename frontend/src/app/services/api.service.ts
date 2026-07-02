import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../models/account';
import { Transaction } from '../models/transaction';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);

  getAccounts(userId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/users/${userId}/accounts`);
  }

  getAccount(accountId: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/accounts/${accountId}`);
  }

  createAccount(userId: number, currency: string, initialBalance: number): Observable<Account> {
    const params = new HttpParams().set('currency', currency).set('initialBalance', initialBalance);
    return this.http.post<Account>(`${this.baseUrl}/users/${userId}/accounts`, null, { params });
  }

  deposit(accountId: number, amount: number): Observable<Account> {
    const params = new HttpParams().set('amount', amount);
    return this.http.post<Account>(`${this.baseUrl}/accounts/${accountId}/deposit`, null, { params });
  }

  debit(accountId: number, amount: number): Observable<Account> {
    const params = new HttpParams().set('amount', amount);
    return this.http.post<Account>(`${this.baseUrl}/accounts/${accountId}/debit`, null, { params });
  }

  exchange(fromAccountId: number, toAccountId: number, amount: number): Observable<Account[]> {
    return this.http.post<Account[]>(`${this.baseUrl}/exchange`, { fromAccountId, toAccountId, amount });
  }

  getTransactions(accountId: number, page: number, size: number): Observable<Transaction[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Transaction[]>(`${this.baseUrl}/accounts/${accountId}/transactions`, { params });
  }

  getAllTransactions(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/accounts/${accountId}/transactions/all`);
  }

  getTransaction(transactionId: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/transactions/${transactionId}`);
  }
}
