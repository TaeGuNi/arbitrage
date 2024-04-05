export default interface Account {
  balance: number;
  available: number;
  locked: number;
}

export const default_account: Account = {
  balance: 0,
  available: 0,
  locked: 0,
};
