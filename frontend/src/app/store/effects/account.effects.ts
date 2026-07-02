import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AccountActions } from '../actions/account.actions';

@Injectable()
export class AccountEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);

  loadAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadAccounts),
      switchMap(({ userId }) =>
        this.api.getAccounts(userId).pipe(
          map((accounts) => AccountActions.loadAccountsSuccess({ accounts })),
          catchError((err) => of(AccountActions.loadAccountsFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  createAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.createAccount),
      switchMap(({ userId, currency, initialBalance }) =>
        this.api.createAccount(userId, currency, initialBalance).pipe(
          map((account) => AccountActions.createAccountSuccess({ account })),
          catchError((err) => of(AccountActions.createAccountFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  selectAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.selectAccount),
      switchMap(({ accountId }) =>
        this.api.getAccount(accountId).pipe(
          map((account) => AccountActions.loadAccountSuccess({ account })),
          catchError((err) => of(AccountActions.loadAccountFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  deposit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.deposit),
      switchMap(({ accountId, amount }) =>
        this.api.deposit(accountId, amount).pipe(
          map((account) => AccountActions.depositSuccess({ account })),
          catchError((err) => of(AccountActions.depositFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  debit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.debit),
      switchMap(({ accountId, amount }) =>
        this.api.debit(accountId, amount).pipe(
          map((account) => AccountActions.debitSuccess({ account })),
          catchError((err) => of(AccountActions.debitFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  exchange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.exchange),
      switchMap(({ fromAccountId, toAccountId, amount }) =>
        this.api.exchange(fromAccountId, toAccountId, amount).pipe(
          map(() => AccountActions.exchangeSuccess()),
          catchError((err) => of(AccountActions.exchangeFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadTransactions),
      switchMap(({ accountId, page, size }) =>
        this.api.getTransactions(accountId, page, size).pipe(
          map((transactions) => AccountActions.loadTransactionsSuccess({ transactions })),
          catchError((err) => of(AccountActions.loadTransactionsFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  loadAllTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadAllTransactions),
      switchMap(({ accountId }) =>
        this.api.getAllTransactions(accountId).pipe(
          map((transactions) => AccountActions.loadAllTransactionsSuccess({ transactions })),
          catchError((err) => of(AccountActions.loadAllTransactionsFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  loadTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadTransaction),
      switchMap(({ transactionId }) =>
        this.api.getTransaction(transactionId).pipe(
          map((transaction) => AccountActions.loadTransactionSuccess({ transaction })),
          catchError((err) => of(AccountActions.loadTransactionFailure({ error: err.message }))),
        ),
      ),
    ),
  );
}
