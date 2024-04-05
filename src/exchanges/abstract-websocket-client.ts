import { WebSocket } from "ws";
import Exchange from "./aggregate/exchange";
import { Symbol } from "./aggregate/dto/symbol";
import { isSupportSymbol } from "./utils";
import { logger } from "../logger";

export default abstract class AbstractWebSocketClinet {
  private _ws: WebSocket | undefined;

  get ws(): WebSocket | undefined {
    return this._ws;
  }

  set ws(ws: WebSocket | undefined) {
    this._ws = ws;
  }

  private _ex: Exchange;

  get ex(): Exchange {
    return this._ex;
  }

  private _timeout: NodeJS.Timeout | undefined;

  get timeout(): NodeJS.Timeout | undefined {
    return this._timeout;
  }

  set timeout(timeout: NodeJS.Timeout | undefined) {
    this._timeout = timeout;
  }

  private _trade_symbol: string | undefined;

  get trade_symbol() {
    return this._trade_symbol;
  }

  private _trade_symbols: Symbol[] = [];

  get trade_symbols() {
    return this._trade_symbols;
  }

  constructor(address: string | URL, ex: Exchange) {
    this._trade_symbol = process.env.TRADE_SYMBOL;
    if (this.trade_symbol !== undefined) {
      this.trade_symbol.split(",").forEach((symbol: string) => {
        symbol = symbol.toUpperCase();
        if (isSupportSymbol(symbol)) {
          const enum_symbol: Symbol = Symbol[symbol as keyof typeof Symbol];
          this._trade_symbols.push(enum_symbol);
        }
      });
    }

    this._ex = ex;
    this.connect(address);
  }

  protected connect(address: string | URL): void {
    if (this.ws === undefined) {
      this.ws = new WebSocket(address, {
        perMessageDeflate: {
          zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3,
          },
          zlibInflateOptions: {
            chunkSize: 10 * 1024,
          },
        },
        timeout: 12000,
      });
      this.on();
      this.init();
      this._timeout = setTimeout(() => {
        this.heartbeat();
      }, 3000);
    }
  }

  protected on(): void {
    throw new Error("needs an implementation.");
  }

  protected init(): void {
    throw new Error("needs an implementation.");
  }

  protected heartbeat(): void {
    throw new Error("needs an implementation.");
  }

  protected subscribe_orderbook(symbol: string | string[]): void {
    throw new Error("needs an implementation.");
  }
}
