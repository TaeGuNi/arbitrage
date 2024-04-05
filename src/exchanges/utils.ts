import { logger } from "../logger";
import { Symbol } from "./aggregate/dto/symbol";

export type symbol_type =
  | "ada"
  | "algo"
  | "atom"
  | "btc"
  | "doge"
  | "eth"
  | "matic"
  | "sol"
  | "krw";

export function symbol_to_string(symbol: Symbol): symbol_type {
  switch (symbol) {
    case Symbol.ADA:
      return "ada";
    case Symbol.ALGO:
      return "algo";
    case Symbol.ATOM:
      return "atom";
    case Symbol.BTC:
      return "btc";
    case Symbol.DOGE:
      return "doge";
    case Symbol.ETH:
      return "eth";
    case Symbol.MATIC:
      return "matic";
    case Symbol.SOL:
      return "sol";
    case Symbol.KRW:
      return "krw";
    default:
      logger.error("symbol %s", symbol);
      throw new Error("not support symbol");
  }
}

export function isSupportSymbol(symbol: string): boolean {
  return Object.keys(Symbol).includes(symbol);
}

export function get_asking_price_unit(symbol: Symbol): number {
  switch (symbol) {
    case Symbol.ADA:
    case Symbol.ALGO:
    case Symbol.DOGE:
      return 0.1;
    case Symbol.ATOM:
      return 10;
    case Symbol.BTC:
    case Symbol.ETH:
      return 1000;
    case Symbol.MATIC:
      return 1;
    case Symbol.SOL:
      // coinone 100
      // upbit 50
      return 100;
    default:
      logger.error("symbol %s", symbol);
      throw new Error("Not support Symbol");
  }
}
