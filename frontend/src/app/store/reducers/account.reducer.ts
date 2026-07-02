import { createReducer, on } from '@ngrx/store';
import { Account } from '../../models/account';
import { Transaction } from '../../models/transaction';
import { AccountActions } from '../actions/account.actions';

export interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  transactions: Transaction[];
  chartTransactions: Transaction[];
  selectedTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AccountState = {
  accounts: [],
  selectedAccount: null,
  transactions: [],
  chartTransactions: [],
  selectedTransaction: null,
  loading: false,
  error: null,
};

export const accountReducer = createReducer(
  initialState,

  on(AccountActions.loadAccounts, (state) => ({ ...state, loading: true, error: null })),
  on(AccountActions.loadAccountsSuccess, (state, { accounts }) => ({ ...state, accounts, loading: false })),
  on(AccountActions.loadAccountsFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(AccountActions.createAccount, (state) => ({ ...state, loading: true, error: null })),
  on(AccountActions.createAccountSuccess, (state, { account }) => ({
    ...state, accounts: [...state.accounts, account], loading: false,
  })),
  on(AccountActions.createAccountFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(AccountActions.selectAccount, (state) => ({ ...state, loading: true, error: null })),
  on(AccountActions.loadAccountSuccess, (state, { account }) => ({ ...state, selectedAccount: account, loading: false })),
  on(AccountActions.loadAccountFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(AccountActions.deposit, (state) => ({ ...state, loading: true, error: null })),
  on(AccountActions.depositSuccess, (state, { account }) => ({ ...state, selectedAccount: account, loading: false })),
  on(AccountActions.depositFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(AccountActions.debit, (state) => ({ ...state, loading: true, error: null })),
  on(AccountActions.debitSuccess, (state, { account }) => ({ ...state, selectedAccount: account, loading: false })),
  on(AccountActions.debitFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(AccountActions.exchange, (state) => ({ ...state, loading: true, error: null })),
  on(AccountActions.exchangeSuccess, (state) => ({ ...state, loading: false })),
  on(AccountActions.exchangeFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(AccountActions.loadTransactions, (state) => ({ ...state, loading: true, error: null })),
  on(AccountActions.loadTransactionsSuccess, (state, { transactions }) => ({
    ...state, transactions: [...state.transactions, ...transactions], loading: false,
  })),
  on(AccountActions.loadTransactionsFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(AccountActions.loadAllTransactions, (state) => ({ ...state, loading: true, error: null })),
  on(AccountActions.loadAllTransactionsSuccess, (state, { transactions }) => ({
    ...state, chartTransactions: transactions, loading: false,
  })),
  on(AccountActions.loadAllTransactionsFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(AccountActions.loadTransaction, (state) => ({ ...state, loading: true, error: null })),
  on(AccountActions.loadTransactionSuccess, (state, { transaction }) => ({
    ...state, selectedTransaction: transaction, loading: false,
  })),
  on(AccountActions.loadTransactionFailure, (state, { error }) => ({ ...state, error, loading: false })),
);
