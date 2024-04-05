import Price from "../../aggregate/dto/price";
import { Symbol } from "../../aggregate/dto/symbol";

export default interface Data {
  quote_currency: "KRW";
  target_currency: Symbol;
  timestamp: number;
  id: string;
  asks: Price[];
  bids: Price[];
}
