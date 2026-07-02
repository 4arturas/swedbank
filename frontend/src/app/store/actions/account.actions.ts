import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { Account } from '../../models/account';
import { Transaction } from '../../models/transaction';

export const AccountActions = createActionGroup({
  source: 'Account',
  events: {
    'Load Accounts': props<{ userId: number }>(),
    'Load Accounts Success': props<{ accounts: Account[] }>(),
    'Load Accounts Failure': props<{ error: string }>(),

    'Create Account': props<{ userId: number; currency: string; initialBalance: number }>(),
    'Create Account Success': props<{ account: Account }>(),
    'Create Account Failure': props<{ error: string }>(),

    'Select Account': props<{ accountId: number }>(),
    'Load Account Success': props<{ account: Account }>(),
    'Load Account Failure': props<{ error: string }>(),

    'Deposit': props<{ accountId: number; amount: number }>(),
    'Deposit Success': props<{ account: Account }>(),
    'Deposit Failure': props<{ error: string }>(),

    'Debit': props<{ accountId: number; amount: number }>(),
    'Debit Success': props<{ account: Account }>(),
    'Debit Failure': props<{ error: string }>(),

    'Exchange': props<{ fromAccountId: number; toAccountId: number; amount: number }>(),
    'Exchange Success': emptyProps(),
    'Exchange Failure': props<{ error: string }>(),

    'Load Transactions': props<{ accountId: number; page: number; size: number }>(),
    'Load Transactions Success': props<{ transactions: Transaction[] }>(),
    'Load Transactions Failure': props<{ error: string }>(),

    'Load All Transactions': props<{ accountId: number }>(),
    'Load All Transactions Success': props<{ transactions: Transaction[] }>(),
    'Load All Transactions Failure': props<{ error: string }>(),

    'Load Transaction': props<{ transactionId: number }>(),
    'Load Transaction Success': props<{ transaction: Transaction }>(),
    'Load Transaction Failure': props<{ error: string }>(),
  },
});
