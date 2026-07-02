export interface Transaction {
  id: number;
  accountId: number;
  type: string;
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: string;
}
