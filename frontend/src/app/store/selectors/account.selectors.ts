import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountState } from '../reducers/account.reducer';

export const selectAccountState = createFeatureSelector<AccountState>('account');

export const selectAccounts = createSelector(selectAccountState, (state) => state.accounts);
export const selectSelectedAccount = createSelector(selectAccountState, (state) => state.selectedAccount);
export const selectTransactions = createSelector(selectAccountState, (state) => state.transactions);
export const selectChartTransactions = createSelector(selectAccountState, (state) => state.chartTransactions);
export const selectSelectedTransaction = createSelector(selectAccountState, (state) => state.selectedTransaction);
export const selectLoading = createSelector(selectAccountState, (state) => state.loading);
export const selectError = createSelector(selectAccountState, (state) => state.error);
