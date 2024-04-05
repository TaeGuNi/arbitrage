import Account, { default_account } from "./account";

export default interface Accounts {
  ada: Account;
  algo: Account;
  atom: Account;
  btc: Account;
  doge: Account;
  eth: Account;
  matic: Account;
  sol: Account;
  krw: Account;
}

export const default_accounts: Accounts = {
  ada: structuredClone(default_account),
  algo: structuredClone(default_account),
  atom: structuredClone(default_account),
  btc: structuredClone(default_account),
  doge: structuredClone(default_account),
  eth: structuredClone(default_account),
  matic: structuredClone(default_account),
  sol: structuredClone(default_account),
  krw: structuredClone(default_account),
};
