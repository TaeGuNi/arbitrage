import Price from "./price";
import { Symbol } from "./symbol";

export default interface Orderbook extends Price {
  date: number;
  exchange: "COINONE" | "UPBIT";
  quote_currency: "KRW";
  target_currency: Symbol;
  type: "ASK" | "BID";
}
